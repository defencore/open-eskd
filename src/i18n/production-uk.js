export default {
  production: 'Виробництво',
  productionSubtitle: 'Зафіксовані наряди та результати виробництва',
  newBatch: 'Створити партію / MVP',
  productionHint:
    'Створіть наряд із поточної конфігурації, розподіліть інструкції за виробництвами й записуйте прийняту кількість та брак по операціях. Партія зберігає початкові маршрути після змін проєкту.',
  productionBatch: 'Партія',
  noBatches: 'Нарядів ще немає',
  noBatchesText:
    'Опишіть маршрути, потім створіть дослідну або серійну партію.',
  batchName: 'Назва партії / наряду',
  batchMode: 'Режим виробництва',
  prototype: 'Дослідний зразок / MVP',
  series: 'Серія',
  batchQuantity: 'Кількість виробів проєкту',
  batchAuthor: 'Хто видав наряд',
  issueBatch: 'Видати наряд',
  batchFrozenHint:
    'Поточна структура, ревізії файлів і маршрути фіксуються у партії. Кількість множить специфікацію проєкту. Подальші зміни не оновлюють видані наряди.',
  batchSnapshotHint:
    'Ця партія зберігає структуру, ревізії файлів і маршрути на момент видачі. Кількість множить саме цю конфігурацію. Подальші зміни проєкту не оновлюють цей наряд.',
  operationsRecorded: 'операцій обліковано',
  batchReport: 'Звіт партії',
  facilityWorkOrder: 'Наряд виробництву',
  recordResult: 'Записати результат',
  acceptedQuantity: 'Прийнята кількість',
  rejectedQuantity: 'Брак',
  resultOperator: 'Виконавець / контролер',
  resultNotes: 'Результат контролю / причина браку',
  evidencePath: 'Шлях до протоколу контролю (необов’язково)',
  operationComplete: 'Обліковано',
  waitingPrerequisites: 'Очікує прийнятих попередніх операцій',
  resultHistory: 'Записи результатів',
  remainingQuantity: 'Залишилось облікувати',
  checkNotDefined: 'Критерії приймання ще не визначено.',
  operation: 'Операція',
  guideBatchNameHelp:
    'Вкажіть зрозумілий ідентифікатор виробництва. Запис зберігатиме зафіксовану конфігурацію.',
  guideBatchNameRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideBatchNameExample: 'MVP-001',
  guideBatchNameExample2: 'BATCH-2026-004',
  guideBatchNameExample3: 'Housing trial run',
  guideBatchModeHelp:
    'Дослідна партія й серія мають однаковий облік операцій. Виберіть мету запуску.',
  guideBatchModeRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideBatchModeExample: 'Prototype: fit check',
  guideBatchModeExample2: 'MVP: complete demonstrator',
  guideBatchModeExample3: 'Series: approved production run',
  guideBatchQuantityHelp:
    'Кількість повних виробів проєкту. На неї множаться кількості деталей та операцій.',
  guideBatchQuantityRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideBatchQuantityExample: '1 product × 4 screws = 4 screws',
  guideBatchQuantityExample2: '10 products × 2 tubes = 20 tubes',
  guideBatchQuantityExample3: '3 standalone parts = 3 parts',
  guideBatchAuthorHelp: 'Хто видає наряд. Ім’я зберігається у партії.',
  guideBatchAuthorRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideBatchAuthorExample: 'Project engineer',
  guideBatchAuthorExample2: 'Production planner',
  guideBatchAuthorExample3: 'Workshop supervisor',
  guideAcceptedHelp:
    'Додайте нові прийняті одиниці. Не повторюйте вже обліковані. Наступні операції чекають приймання всієї попередньої партії.',
  guideAcceptedRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideAcceptedExample: '5 conforming tubes',
  guideAcceptedExample2: '1 accepted prototype',
  guideAcceptedExample3: '0 accepted / 2 rejected',
  guideRejectedHelp:
    'Додайте нові забраковані одиниці й опишіть причину. Прийняті не можуть перевищувати кількість наряду. Брак зберігається в історії, коли заміну чи доопрацьовану одиницю прийнято.',
  guideRejectedRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideRejectedExample: '1: hole outside tolerance',
  guideRejectedExample2: '2: failed visual inspection',
  guideRejectedExample3: '0: all units conform',
  guideOperatorHelp: 'Вкажіть виконавця або контролера операції.',
  guideOperatorRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideOperatorExample: 'Machinist name',
  guideOperatorExample2: 'Assembly technician',
  guideOperatorExample3: 'Quality inspector',
  guideResultNotesHelp:
    'Запишіть підставу приймання або конкретну причину браку. Записи лише додаються й передаються з JSON проєкту.',
  guideResultNotesRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideResultNotesExample: 'Dimensions checked against drawing B',
  guideResultNotesExample2: 'Fit check passed; inspection record attached',
  guideResultNotesExample3: 'Rejected: burrs remain at hole exit',
  guideEvidenceHelp:
    'Необов’язковий відносний шлях до вимірювань, фото чи протоколу. Посилання потрапляє у звіт партії.',
  guideEvidenceRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideEvidenceExample: 'reports/MVP-001/tube-check.pdf',
  guideEvidenceExample2: 'reports/MVP-001/fit-check.jpg',
  guideEvidenceExample3: 'reports/BATCH-004/test.csv',
  productionSearch: 'Знайти операцію, компонент або виробництво…',
  productionMore: 'Показати ще операції',
  operationInstruction: 'Інструкція та попередні операції',
  productionQuantityError: 'Прийнята кількість перевищує кількість наряду.',
  productionPrerequisiteError:
    'Прийміть усю попередню партію перед записом наступної операції.',
  productionResultError:
    'Вкажіть коректні нові кількості, виконавця та причину браку.',
  batchNameUsed: 'Партія з такою назвою вже існує.',
  productionNeedsOperations:
    'Опишіть операції виготовлення або контролю перед видачею наряду.',
  productionInputRouteMissing:
    'Перед видачею партії додайте операцію контролю або виготовлення для цього обов’язкового входу',
};
