import { useEffect, useRef, useState } from 'react'
import { AccordionCells, DocCell, SelectField } from '@mbari/react-ui'
import {
  useDeployments,
  useDocuments,
  useDeleteDocument,
} from '@mbari/api-client'
import { DateTime } from 'luxon'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { AccessoryButton, Dropdown, Attachment } from '@mbari/react-ui'
import filterDocuments, {
  DOCUMENT_FILTER_TYPES,
  DocumentFilterType,
} from '../lib/filterDocuments'
import { useQueryClient } from 'react-query'
import useGlobalModalId, { GlobalModalMetaData } from '../lib/useGlobalModalId'
import { swallow } from '@mbari/utils'
import toast from 'react-hot-toast'

interface DocsSectionProps {
  authenticated?: boolean
  vehicleName: string
  currentDeploymentId?: number
}

const DocsSection: React.FC<DocsSectionProps> = ({
  authenticated,
  vehicleName,
  currentDeploymentId,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const queryClient = useQueryClient()
  const { setGlobalModalId } = useGlobalModalId()
  const [selectedType, setSelectedType] =
    useState<DocumentFilterType>('All Documents')
  const [selectedDeployment, setSelectedDeployment] = useState<null | string>(
    null
  )
  const isFilteringDeployment = selectedType === 'By Deployment'

  const { data: documentData, isLoading, isFetching } = useDocuments()
  const { data: deploymentData } = useDeployments(
    {
      vehicle: vehicleName,
    },
    {
      enabled: isFilteringDeployment,
    }
  )
  const data = documentData?.filter((doc) =>
    filterDocuments({
      type: selectedType,
      doc,
      deploymentId: selectedDeployment,
      vehicleName,
    })
  )

  const [currentMoreMenu, setCurrentMoreMenu] = useState<{
    docId: number
    docInstanceId: number
    rect: DOMRect
  } | null>(null)
  const closeMoreMenu = () => setCurrentMoreMenu(null)
  const openMoreMenu = (
    target: { docId: number; docInstanceId: number },
    rect?: DOMRect
  ) => {
    if (rect) {
      setCurrentMoreMenu({ ...target, rect })
    }
  }
  const handleAddClick = swallow(() => {
    setGlobalModalId({ id: 'editDocument' })
  })

  const { mutateAsync: deleteDocument } = useDeleteDocument()
  const handleDelete = async () => {
    if (currentMoreMenu?.docId) {
      await deleteDocument({ docId: currentMoreMenu?.docId })
      toast.success('Document deleted')
      queryClient.invalidateQueries(['document', 'documents'])
    }
  }

  const handleAttach = (meta?: GlobalModalMetaData) => {
    console.log('handleAttach', meta)
    setGlobalModalId({ id: 'attachDocument', meta })
  }

  const handleEdit = (docInstanceId?: number, duplicate?: boolean) => {
    setGlobalModalId({
      id: 'editDocument',
      meta: {
        docInstanceId,
        duplicate,
      },
    })
  }

  const cellAtIndex = (index: number) => {
    const item = data?.[index]
    const unixTime = item?.latestRevision?.unixTime
    const time = unixTime
      ? DateTime.fromMillis(unixTime).toLocaleString(
          DateTime.TIME_24_WITH_SECONDS
        )
      : ''

    const date = unixTime
      ? DateTime.fromMillis(unixTime).toLocaleString(DateTime.DATE_FULL)
      : ''

    const attachments = [
      item?.deploymentBriefs?.map(({ deploymentId, name }) => ({
        id: deploymentId ? deploymentId.toString() : '',
        name: name ?? '',
        type: 'deployment' as Attachment['type'],
      })) ?? [],
      item?.vehicleNames?.map((vehicleName) => ({
        id: vehicleName,
        name: vehicleName,
        type: 'vehicle' as Attachment['type'],
      })) ?? [],
    ].flat()

    const handleRemoveAttachment = (attachment: Attachment) =>
      setGlobalModalId({
        id: 'detachDocument',
        meta: {
          docId: item?.docId ?? 0,
          documentName: item?.name ?? '',
          vehicleName: attachment.name,
          deploymentName: attachment.name,
          deploymentId: attachment.id as number,
          attachmentType: attachment.type,
        },
      })

    const handleSelectDocument = () => {
      handleEdit(item?.latestRevision?.docInstanceId)
    }

    return (
      <DocCell
        className={'border-b border-slate-200'}
        label={item?.name ?? ''}
        attachments={attachments}
        time={time}
        date={date}
        onSelectAttachment={handleRemoveAttachment}
        onMoreClick={openMoreMenu}
        onSelect={handleSelectDocument}
        docId={item?.docId as number}
        docInstanceId={item?.latestRevision?.docInstanceId as number}
      />
    )
  }

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      if (typeof window !== 'undefined') {
        if (rect.bottom > window.innerHeight) {
          menuRef.current.style.transform = `translateY(${
            window.innerHeight - rect.bottom
          }px)`
        }
      }
    }
  }, [currentMoreMenu])

  return (
    <>
      <header className="flex p-2">
        <div className="flex flex-grow flex-col">
          <SelectField
            name="Filter"
            options={DOCUMENT_FILTER_TYPES.map((name) => ({ name, id: name }))}
            className="flex-grow"
            value={selectedType}
            onSelect={(id) =>
              setSelectedType((id ?? 'All Documents') as DocumentFilterType)
            }
          />
          {isFilteringDeployment && (
            <SelectField
              name="Deployment"
              options={deploymentData?.map((d) => ({
                name: d.name,
                id: d.deploymentId?.toString(),
              }))}
              className="flex-grow"
              value={selectedDeployment ?? ''}
              onSelect={(id) => setSelectedDeployment(id ?? null)}
              clearable
            />
          )}
        </div>
        {authenticated && (
          <div className="mb-auto flex pl-2">
            <AccessoryButton
              icon={faPlus}
              label={'Add Document'}
              onClick={handleAddClick}
            />
          </div>
        )}
      </header>
      <AccordionCells
        cellAtIndex={cellAtIndex}
        count={data?.length}
        loading={isLoading || isFetching}
      />
      {currentMoreMenu && (
        <div
          className="fixed mr-2 mb-2 min-w-[140px] whitespace-nowrap"
          ref={menuRef}
          style={{
            top:
              (currentMoreMenu?.rect?.top ?? 0) -
              (menuRef.current?.offsetHeight ?? 0),
            right:
              typeof window !== 'undefined'
                ? window.innerWidth - (currentMoreMenu?.rect?.right ?? 0)
                : 0,
            zIndex: 1001,
          }}
        >
          <Dropdown
            onDismiss={closeMoreMenu}
            options={[
              {
                label: 'Edit',
                onSelect: () => {
                  handleEdit?.(currentMoreMenu?.docInstanceId)
                  closeMoreMenu()
                },
              },
              {
                label: 'Attach to...',
                onSelect: () => {
                  handleAttach({
                    docInstanceId: currentMoreMenu?.docInstanceId,
                    docId: currentMoreMenu?.docId,
                    deploymentId: currentDeploymentId,
                    documentName: documentData?.find(
                      ({ docId }) => docId === currentMoreMenu?.docId
                    )?.name,
                    vehicleName,
                  })
                  closeMoreMenu()
                },
              },
              {
                label: 'Duplicate',
                onSelect: () => {
                  handleEdit?.(currentMoreMenu?.docInstanceId, true)
                  closeMoreMenu()
                },
              },
              {
                label: 'Delete',
                onSelect: () => {
                  handleDelete?.()
                  closeMoreMenu()
                },
              },
            ]}
          />
        </div>
      )}
    </>
  )
}

DocsSection.displayName = 'Dash2.Components.DocsSection'

export default DocsSection
