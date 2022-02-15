// https://github.com/EnCiv/undebate-ssp/issues/51

import React from 'react'
import { createUseStyles } from 'react-jss'
import cx from 'classnames'
import SvgDeadlineMissed from '../svgr/deadline-missed'
import SvgCheck from '../svgr/check'
import SvgReminder from '../svgr/reminder-sent'
import SvgFeelingBlue from '../svgr/feeling-blue'

export default function Submission(props) {
    const { className, style, electionObj } = props
    const classes = useStyles(props)

    const getSubmission = () => {
        const sortedSubmissions = electionObj.moderator.submissions.sort((a, b) => b.date - a.date)
        return sortedSubmissions[0]
    }

    const submission = getSubmission()

    const checkReminderSent = () => {
        const reminder = electionObj?.timeline?.moderatorDeadlineReminderEmails
        for (const key in reminder) {
            if (reminder[key]?.sent) {
                return true
            }
        }
        return false
    }

    const checkVideoSubmitted = () => {
        return submission.url !== ''
    }

    const checkSubmissionBeforeDeadline = () => {
        const submission = electionObj?.timeline?.moderatorSubmissionDeadline
        for (const key in submission) {
            if (submission[key]?.date && submission[key]?.sent) {
                return true
            }
        }
        return false
    }

    const getSubmissionStatus = () => {
        if (submission && !checkSubmissionBeforeDeadline()) return 'missed'
        if (submission && checkVideoSubmitted()) return 'submitted'
        if (checkReminderSent()) return 'sent'
        return 'default'
    }

    const getSubmissionDaysLeft = () => {
        const dueDate = Date.parse(electionObj.timeline.moderatorSubmissionDeadline[0].date)
        const currDate = new Date()
        return Math.round((dueDate - currDate) / 86400000)
    }

    const getSubmissionDaysAgo = () => {
        const sentDate = Date.parse(submission.date)
        const currDate = Date.now()
        console.log(currDate, sentDate)
        return Math.round((currDate - sentDate) / 86400000)
    }

    let statusTitle
    let statusDesc
    let prevIcon
    let cornerPic
    let missed = false
    switch (getSubmissionStatus()) {
        case 'missed':
            statusTitle = 'Deadline Missed!'
            prevIcon = <SvgDeadlineMissed />
            cornerPic = <SvgFeelingBlue />
            missed = true
            break
        case 'submitted':
            statusTitle = 'Video Submitted!'
            statusDesc = getSubmissionDaysAgo() + ' days ago'
            prevIcon = <SvgCheck />
            break
        case 'sent':
            statusTitle = 'Reminder Sent!'
            statusDesc = getSubmissionDaysLeft() + ' days left'
            prevIcon = <SvgReminder />
            break
        case 'default':
            statusDesc = getSubmissionDaysLeft() + ' days left'
            statusTitle = 'No Submission Yet'
            break
    }

    const icon = <div className={classes.icon}>{prevIcon}</div>
    return (
        <div className={cx(className, classes.container)} style={style}>
            <div className={cx(classes.card, { [classes.backgroundRed]: missed })}>
                <div className={classes.preview}>
                    {submission?.url && getSubmissionStatus() === 'submitted' ? (
                        <iframe src={submission?.url} frameborder='0'>
                            {icon}
                        </iframe>
                    ) : (
                        <div className={classes.placeholder}>{icon}</div>
                    )}
                </div>
                <div className={classes.meta}>
                    <p className={cx(classes.title, { [classes.colorWhite]: missed })}>{statusTitle}</p>
                    <p className={cx(classes.desc, { [classes.colorLightRed]: missed })}>{statusDesc}</p>
                </div>
            </div>
            <div className={classes.cornerPic}>{cornerPic}</div>
        </div>
    )
}

const useStyles = createUseStyles(theme => ({
    container: {
        padding: '2rem',
        backgroundColor: '#ececec',
    },
    card: {
        width: '18.75rem',
        backgroundColor: '#d4d5d6',
        padding: '.5rem',
        borderRadius: '0.625rem',
    },
    preview: {
        backgroundColor: '#ffffff',
        height: '10rem',
    },
    title: {
        paddingTop: '.5rem',
        paddingLeft: '.5rem',
        margin: '0',
        fontWeight: '500',
    },
    desc: {
        padding: '0',
        margin: '0',
        color: '#7d8084',
        fontSize: '0.875rem',
        paddingLeft: '.5rem',
        paddingBottom: '.5rem',
    },
    cornerPic: {
        display: 'flex',
        fontSize: '14rem',
        justifyContent: 'right',
        marginBottom: '0',
    },
    icon: {
        fontSize: '3rem',
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholder: {
        width: '100%',
        height: '100%',
    },
    backgroundRed: {
        backgroundColor: '#ee6055',
    },
    colorWhite: {
        color: 'white',
    },
    colorLightRed: {
        color: '#f3ada7',
    },
}))
