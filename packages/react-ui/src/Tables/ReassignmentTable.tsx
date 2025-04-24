import clsx from 'clsx'
import { ReassignmentCell } from '../Cells/ReassignmentCell'
import { RoleChangeType } from '../Modals/ReassignmentModal'
import { AbsoluteOverlay } from '../Indicators/AbsoluteOverlay'

export interface ReassignmentTableProps {
  vehicles?: {
    name: string
    picOperators: string[]
    onCallOperators: string[]
  }[]
  currentUserName: string
  onRoleChange: (
    vehicleName: string,
    roleChangeType: RoleChangeType,
    isPic: boolean
  ) => void
  isLoading?: boolean
}

const styles = {
  table: 'w-full',
  headerCell: 'py-1 text-black text-left',
  bodyRow:
    'border-b last:border-b-0 border-stone-200 grid grid-cols-5 gap-x-3 pb-3',
  vehicleCell: 'col-span-1 text-xl text-slate-600',
  operatorCell: 'col-span-2 flex pt-0.5',
}

export const ReassignmentTable: React.FC<ReassignmentTableProps> = ({
  vehicles = [],
  currentUserName,
  onRoleChange,
  isLoading,
}) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr className="grid grid-cols-5 gap-3">
          <th className={clsx(styles.headerCell, 'col-span-1')}></th>
          <th className={clsx(styles.headerCell, 'col-span-2')}>PIC</th>
          <th className={clsx(styles.headerCell, 'col-span-2')}>On-call</th>
        </tr>
      </thead>
      <tbody className="flex flex-col gap-y-3">
        {vehicles.map((vehicle) => (
          <tr key={vehicle.name} className={styles.bodyRow}>
            <td className={styles.vehicleCell}>{vehicle.name}</td>
            <td className={styles.operatorCell}>
              <ReassignmentCell
                operators={vehicle.picOperators}
                currentUserName={currentUserName}
                onSignIn={() => onRoleChange(vehicle.name, 'in', true)}
                onSignOut={() => onRoleChange(vehicle.name, 'off', true)}
                isLoading={isLoading}
                signInAriaLabel={`Join ${vehicle.name} as PIC`}
                signOutAriaLabel={`Remove ${currentUserName} from ${vehicle.name} as PIC`}
              />
            </td>
            <td className={styles.operatorCell}>
              <ReassignmentCell
                operators={vehicle.onCallOperators}
                currentUserName={currentUserName}
                onSignIn={() => onRoleChange(vehicle.name, 'in', false)}
                onSignOut={() => onRoleChange(vehicle.name, 'off', false)}
                isLoading={isLoading}
                signInAriaLabel={`Join ${vehicle.name} as On-call`}
                signOutAriaLabel={`Remove ${currentUserName} from ${vehicle.name} as On-call`}
              />
            </td>
          </tr>
        ))}
      </tbody>
      {isLoading ? <AbsoluteOverlay /> : null}
    </table>
  )
}

ReassignmentTable.displayName = 'Tables.ReassignmentTable'
