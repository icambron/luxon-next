import { SharedFormatOpts } from "../types";

export interface TokenFormatOpts extends SharedFormatOpts {
  forceSimple?: boolean,
  allowZ?: boolean,
  calendar?: string
}