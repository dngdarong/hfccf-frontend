import common from './common'
import dashboard from './dashboard'
import teachers from './teachers'
import students from './students'
import classes from './classes'
import tasks from './tasks'
import submissions from './submissions'

export default {
  english: {
    ...common.english,
    ...dashboard.english,
    ...teachers.english,
    ...students.english,
    ...classes.english,
    ...tasks.english,
    ...submissions.english,
  },
}
