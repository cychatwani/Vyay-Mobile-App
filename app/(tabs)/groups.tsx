// Temporary alias route: "Groups" currently lands on the same screen as
// "Contacts" (the existing friends screen, which contains its own
// Friends/Groups switcher). This will become a dedicated groups screen;
// the re-export keeps the tab real in the navigator without duplicating UI.
export { default } from "./friends";
