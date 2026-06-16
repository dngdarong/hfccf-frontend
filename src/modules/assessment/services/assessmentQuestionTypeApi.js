import http from '@/services/http'

export const assessmentQuestionTypeApi = {
  list: () => http.get('/assessment/question-types'),
}
