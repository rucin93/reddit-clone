import { ErrorMessage } from 'formik'
import { FieldError } from '../generated/graphql'

export function toErrorMap(errors: FieldError[]) {
  const errorMap: Record<string, string> = {}
  errors.forEach(({ field, message }) => (errorMap[field] = message))

  return errorMap
}
