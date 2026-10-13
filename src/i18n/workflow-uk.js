export default {
  production: 'Виробництво',
  productionSubtitle: 'Зафіксовані наряди та результати виробництва',
  saveProjectJson: 'Зберегти JSON проєкту',
  exportWorkingHint:
    'Експорт містить поточну робочу конфігурацію та зміни після останньої збереженої версії.',
  addReference: 'Додати посилання на файл',
  fileReference: 'Посилання на файл',
  referenceHint:
    'Описуйте файли відносними шляхами. CAD, креслення та зображення залишаються у локальних каталогах проєкту.',
  filePath: 'Відносний шлях до файлу',
  fileHash: 'SHA-256 (необов’язково)',
  fileRequirement: 'Обов’язковість файлу',
  requiredFile: 'Обов’язковий',
  optionalFile: 'Необов’язковий / обмежений доступ',
  image: 'Зображення деталі',
  suggestFilePath: 'Запропонувати стандартний шлях',
  localReferencePreview:
    'Відкрийте файл у локальному каталозі проєкту. Експортований HTML-звіт містить відносні посилання та зображення деталей.',
  noFileHash: 'Контрольну суму не вказано; перевіряється лише наявність.',
  copyPath: 'Копіювати шлях',
  localFileStructure: 'Локальні файли проєкту',
  fileWorkflow1: 'Опишіть потрібні шляхи',
  fileWorkflow2: 'Створіть каталоги й перенесіть реальні файли',
  fileWorkflow3: 'Перевірте комплектність і сформуйте звіт',
  createDirectories: 'Створити каталоги',
  checkFiles: 'Перевірити файли',
  importFileCheck: 'Імпортувати результат перевірки',
  exportHtmlReport: 'HTML-звіт',
  lastFileCheck: 'Остання перевірка цієї структури',
  fileCheckStale: 'Структуру змінено; перевірте файли повторно',
  fileProblems: 'зауважень до файлів',
  verificationDetails: 'Деталі перевірки',
  noFileCheck: 'Наявність локальних файлів ще не перевірено.',
  createScriptHint:
    'Відкрийте термінал у корені проєкту й вставте скрипт або завантажте та запустіть його там. Він створює лише відсутні каталоги. Наявні файли зберігаються. Окремо збережіть project.json у цьому корені.',
  checkScriptHint:
    'Запустіть у корені проєкту. Скрипт читає файли, показує відсутні, порожні файли й заглушки та звіряє вказані SHA-256. Файли не змінюються.',
  scriptPlatform: 'Операційна система',
  placeholderMode: 'Позначення відсутніх файлів',
  directoriesOnly: 'Лише каталоги',
  directoriesAndMarkers: 'Каталоги + позначки .eskd-placeholder',
  generatedScript: 'Підготовлений скрипт',
  copyScript: 'Копіювати скрипт',
  downloadScript: 'Завантажити скрипт',
  copied: 'Скопійовано',
  copyManually: 'Текст виділено. Скопіюйте через Ctrl+C / Cmd+C.',
  checkCaptureHint:
    'Для імпорту результату завантажте check-files і збережіть його вивід у НОВИЙ JSON-файл. Ці команди не перезаписують наявний файл результату.',
  fileCheckImported: 'Результат перевірки імпортовано',
  reportRootHint:
    'Збережіть цей HTML у корені проєкту поруч із project.json. Посилання й зображення використовують відносні шляхи.',
  reportReadiness: 'Готовність і перевірка',
  engineeringIssues: 'Зауваження до оформлення',
  fileCheckMeaning:
    'Наявність файлу не підтверджує правильність креслення й не є дозволом на виготовлення. Перевірка — імпортований результат огляду файлів на конкретний момент.',
  reportFrozen:
    'Статичний звіт цієї конфігурації. Сформуйте повторно після змін.',
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
  issue_prerequisiteRevision:
    'Потрібно перевірити ревізію попередньої операції',
  jsonExportText:
    'Один легкий файл: структура, шляхи, маршрути, історія та результати виробництва.',
  zipExportText:
    'JSON, скрипти, специфікація та локальний HTML-звіт. Інженерні файли передаються окремо.',
  noDocumentsText:
    'Додайте відносні шляхи до потрібних креслень, моделей і зображень.',
  attachmentHint:
    'Посилання на файли входять у JSON; самі файли залишаються на диску.',
  addFiles: 'Додати посилання',
  browseFiles: 'Додати посилання на файл',
  fileStatus_unknown: 'Не перевірено',
  fileStatus_present: 'Є; вміст не звірено',
  fileStatus_verified: 'SHA-256 збігається',
  fileStatus_missing: 'Відсутній',
  fileStatus_placeholder: 'Лише заглушка',
  fileStatus_empty: 'Порожній файл',
  fileStatus_mismatch: 'SHA-256 не збігається',
  fileStatus_unsafe: 'Посилання або неправильний тип',
  fileStatus_unreadable: 'Не вдалося прочитати',
  'fileStatus_hash-unavailable': 'Немає засобу звіряння SHA-256',
  guideFileComponentHelp: 'Пов’яжіть файл із деталлю або всім проєктом.',
  guideFileComponentRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideFileComponentExample: 'Printed housing',
  guideFileComponentExample2: 'Tube assembly',
  guideFileComponentExample3: 'Project quality plan',
  guideFileTypeHelp:
    'Виберіть призначення. Зображення деталі показується у локальному HTML-звіті.',
  guideFileTypeRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideFileTypeExample: 'drawing → .pdf',
  guideFileTypeExample2: 'model → .step',
  guideFileTypeExample3: 'image → preview.png',
  guideFileRevisionHelp:
    'Вкажіть ревізію документа незалежно від назви файлу. Після перевірки змін підтвердьте нову ревізію у пов’язаних операціях.',
  guideFileRevisionRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideFileRevisionExample: 'A',
  guideFileRevisionExample2: 'B',
  guideFileRevisionExample3: '03',
  guideFilePathHelp:
    'Шлях від кореня проєкту. Використовуйте /, без абсолютного шляху та .. . Стандартна пропозиція містить позначення й ревізію.',
  guideFilePathRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideFilePathExample: 'components/PRJ.001.101/rev-A/PRJ.001.101_drawing.pdf',
  guideFilePathExample2: 'components/PRJ.001.101/rev-A/preview.png',
  guideFilePathExample3: 'documents/inspection-plan.pdf',
  guideFileHashHelp:
    'Необов’язкова очікувана SHA-256. Отримайте локально й вставте 64 шістнадцяткові символи в нижньому регістрі. Великі файли не потрапляють у браузер.',
  guideFileHashRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideFileHashExample: 'macOS: shasum -a 256 ./drawing.pdf',
  guideFileHashExample2: 'Linux: sha256sum ./drawing.pdf',
  guideFileHashExample3:
    'PowerShell: (Get-FileHash -LiteralPath ./drawing.pdf).Hash.ToLowerInvariant()',
  guideFileRequirementHelp:
    'Обов’язкові файли потрібні цьому комплекту. Необов’язкові можна навмисно не передавати; заглушка позначає відсутність і не підміняє креслення.',
  guideFileRequirementRule:
    'Керуйтеся вимогами проєкту та затвердженою документацією.',
  guideFileRequirementExample: 'Required: manufacturing drawing',
  guideFileRequirementExample2: 'Optional: supplier source model',
  guideFileRequirementExample3: 'Optional: component preview',
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
  filePathError:
    'Вкажіть унікальний відносний шлях із /. Не використовуйте .., зарезервовані назви й однаковий шлях для файлу та каталогу.',
  verificationReportError:
    'Ця перевірка не відповідає поточному проєкту. Сформуйте й запустіть його актуальний скрипт перевірки.',
  productionNeedsOperations:
    'Опишіть операції виготовлення або контролю перед видачею наряду.',
  guideFileImageHelp:
    'Оберіть локальне зображення PNG, JPEG, WebP, GIF або SVG. HTML-звіт показує його за відносним шляхом. Зображення залишається на диску.',
  guideFileImageExample: 'components/P.001.101/rev-A/preview.png',
  guideFileImageExample2: 'components/P.001.101/rev-A/photo.jpg',
  guideFileImageExample3: 'components/P.001.101/rev-A/assembly-view.svg',
  guideFileImageRule:
    'Збережіть report.html у корені проєкту, щоб шляхи до зображень відкривалися правильно.',
  reportParent: 'Батьківський вузол',
};
