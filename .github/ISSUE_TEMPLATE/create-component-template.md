---
name: Create Component Template
about: Specify a new component for the UI library
title: Implement [NAME] Component
labels: ''
assignees: ''

---

## Scaffold the New Component

To scaffold this component generate a blank component:

```
yarn scaffold -t component ./packages/react-ui/src/[Category]/[ComponentName]
```

### Is there a form involved?

If you need to add a form be sure to use the form template and add your form to the `Forms` directory of the `@mbari/react-ui` package:

```
yarn scaffold -t form ./packages/react-ui/src/Forms/[FormComponentName]
```

## Reference Design

Use the following design in your story parameter:
https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=752%3A465

i.e.
```ts
Standard.parameters = {
  design: {
    type: "figma",
    url: "https://www.figma.com/file/FtsKsOCBQ2YjTZlwezG6aI/MBARI-Components?node-id=752%3A465"
  }
}
```

### A Note About Forms in Modals

There is a gotcha when creating a modal with an embedded form for the MBARI project. The UI design has a submit button built into the modal's footer. You can use an HTML ID on the form and then specify the id as the 'form' attribute on the modal to get the confirm button to act as an external submit button for the form. Pseudocode for illustration purposes:

```tsx
    <Modal title="..." form="[FORM_INSTANCE_NAME]" open>
      <[ComponentName]Form
          id="[FORM_INSTANCE_NAME]"
          hideSubmit
      />
    </Modal>
```
