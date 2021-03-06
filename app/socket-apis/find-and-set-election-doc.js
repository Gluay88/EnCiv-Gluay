// https://github.com/EnCiv/undebate-ssp/issues/72

import { Iota } from 'civil-server'
import Joi from 'joi'
import JoiObjectID from 'joi-objectid'

Joi.objectId = JoiObjectID(Joi)

const Integer = /^[0-9]+$/
const ObjectID = /^[0-9a-fA-F]{24}$/
const SANE = 4096

const electionSchema = Joi.object({
    webComponent: 'ElectionDoc',
    electionName: Joi.string().max(SANE),
    organizationName: Joi.string().max(SANE),
    electionDate: Joi.string().isoDate(),
    questions: Joi.object().pattern(
        Joi.string().pattern(Integer),
        Joi.object({
            text: Joi.string().max(SANE),
            time: Joi.string().pattern(Integer),
        })
    ),
    script: Joi.object().pattern(
        Joi.string().pattern(Integer),
        Joi.object({
            text: Joi.string().max(SANE),
        })
    ),
    moderator: Joi.object({
        name: Joi.string().max(SANE),
        email: Joi.string().email(),
        message: Joi.string().max(SANE),
        invitations: Joi.array().items(
            Joi.object({
                _id: Joi.objectId(),
                text: Joi.string().max(SANE),
                sentDate: Joi.string().isoDate(),
                responseDate: Joi.string().isoDate(),
                status: Joi.string().max(SANE),
            })
        ),
        submissions: Joi.array().items(
            Joi.object({
                _id: Joi.objectId(),
                url: Joi.string().max(SANE),
                date: Joi.string().isoDate(),
            })
        ),
    }),
    candidates: Joi.object().pattern(
        Joi.string().pattern(ObjectID),
        Joi.object({
            uniqueId: Joi.string().pattern(ObjectID),
            name: Joi.string().max(SANE),
            email: Joi.string().email(),
            office: Joi.string().max(SANE),
            region: Joi.string().max(SANE),
            invitations: Joi.array().items(
                Joi.object({
                    _id: Joi.objectId(),
                    text: Joi.string().max(SANE),
                    sentDate: Joi.string().isoDate(),
                    responseDate: Joi.string().isoDate(),
                    status: Joi.string().max(SANE),
                })
            ),
            submissions: Joi.array().items(
                Joi.object({
                    _id: Joi.objectId(),
                    url: Joi.string().max(SANE),
                    date: Joi.string().isoDate(),
                    parentId: Joi.string().pattern(ObjectID),
                })
            ),
        })
    ),
    timeline: {
        moderatorDeadlineReminderEmails: Joi.object().pattern(
            Joi.string().pattern(Integer),
            Joi.object({
                date: Joi.string().isoDate(),
                sent: Joi.boolean(),
            })
        ),
        moderatorSubmissionDeadline: Joi.object().pattern(
            Joi.string().pattern(Integer),
            Joi.object({
                date: Joi.string().isoDate(),
                sent: Joi.boolean(),
            })
        ),
        moderatorInviteDeadline: Joi.object().pattern(
            Joi.string().pattern(Integer),
            Joi.object({
                date: Joi.string().isoDate(),
                sent: Joi.boolean(),
            })
        ),
        candidateDeadlineReminderEmails: Joi.object().pattern(
            Joi.string().pattern(Integer),
            Joi.object({
                date: Joi.string().isoDate(),
                sent: Joi.boolean(),
            })
        ),
        candidateSubmissionDeadline: Joi.object().pattern(
            Joi.string().pattern(Integer),
            Joi.object({
                date: Joi.string().isoDate(),
                sent: Joi.boolean(),
            })
        ),
    },
    undebateDate: Joi.string().isoDate(),
})

export default async function findAndSetElectionDoc(query, doc, cb) {
    if (!this.synuser) return cb && cb() // no user
    const valid = electionSchema.validate(doc)
    if (valid.error) {
        logger.error('ElectionDoc validation', JSON.stringify(valid, null, 2))
        return cb && cb()
    }
    try {
        // upsert
        await Iota.updateOne(query, { $set: { webComponent: doc } }, { upsert: true })
        return cb && cb(true)
    } catch (err) {
        logger.error('upsertElectionDoc', err)
        return cb && cb()
    }
}
