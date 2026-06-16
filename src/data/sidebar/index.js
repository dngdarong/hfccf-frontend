import main from './main.json'
import superAdmin from './super-admin.json'
import english from './english.json'
import preschool from './preschool.json'
import scholarship from './scholarship.json'
import sport from './sport.json'
import dsam from './dsam.json'

// Keep sidebar navigation split by section so each program can evolve without
// reopening a single large JSON file for unrelated changes.
export default {
  sections: [
    ...main.sections,
    ...superAdmin.sections,
    ...english.sections,
    ...preschool.sections,
    ...scholarship.sections,
    ...sport.sections,
    ...dsam.sections,
  ],
}
