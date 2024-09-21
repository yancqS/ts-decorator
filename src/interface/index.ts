import formidable from "formidable";

export enum TypeEnum {
  ALL = 'all',
}

export type IMulitlePartType = {
  fields: formidable.Fields<string>,
  files: formidable.Files<string>
}
