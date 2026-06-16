import { computed } from 'vue'
import { useFormBuilderStore } from '../stores/useFormBuilderStore'

export function useFormBuilder() {
  const store = useFormBuilderStore()

  const canPublish = computed(
    () => store.template?.status === 'draft' && store.sections.length > 0,
  )

  function getQuestionsForSection(sectionId) {
    return store.template?.questions?.filter((q) => q.section_id === sectionId) ?? []
  }

  function findQuestionType(typeKey) {
    return store.questionTypes.find((t) => t.key === typeKey)
  }

  return {
    store,
    canPublish,
    getQuestionsForSection,
    findQuestionType,
  }
}
