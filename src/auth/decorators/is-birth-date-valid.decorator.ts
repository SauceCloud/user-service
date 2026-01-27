import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ name: 'IsBirthDateValid', async: false })
export class IsBirthDateValidConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const date = new Date(value)
    if (isNaN(date.getTime())) return false

    return date >= new Date('1900-01-01') && date <= new Date()
  }
}
