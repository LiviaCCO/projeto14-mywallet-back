import joi from "joi"

export const transactionSchema = joi.object({
    value: joi.number().positive().precision(2).required(),
    description: joi.string().required()
})