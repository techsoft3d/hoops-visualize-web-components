export type CadConfigurationListClickEvent = CustomEvent<
  { cadConfigurationId: number } & MouseEvent
>;
declare global {
  interface CustomEventMap {
    'hoops-cad-configuration-list-click': CadConfigurationListClickEvent;
  }
}

export {};
