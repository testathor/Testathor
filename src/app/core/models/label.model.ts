export class Label {

  labelCategory: string;
  labelValue: string;
  labelColor: string;
  labelDefinition?: string;

  constructor(labelCategory: string, labelValue: string, labelColor: string, labelDefinition?: string) {
    this.labelValue = labelValue;
    this.labelColor = labelColor;
    this.labelCategory = labelCategory;
    this.labelDefinition = labelDefinition;
  }

  /**
   * Returns the name of the label with the format of
   * 'category'.'value' (e.g. severity.Low) if a category exists or
   * 'value' if the category does not exist.
   */
  public getFormattedName(): string {
    return (this.labelCategory === undefined || this.labelCategory === '')
      ? this.labelValue
      : (this.labelCategory.concat('.', this.labelValue));
  }

  public equals(label: Label) {
    return this.labelValue === label.labelValue
        && this.labelColor === label.labelColor && this.labelCategory === label.labelCategory;
  }
}
