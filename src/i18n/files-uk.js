export default {
  file: 'Файл',
  documentType: 'Тип документа',
  component: 'Компонент',
  projectLevel: 'Документ проєкту',
  fileSize: 'Розмір',
  download: 'Завантажити',
  noDocuments: 'Документації поки немає',
  drawing: 'Креслення деталі',
  assemblyDrawing: 'Складальне креслення',
  specification: 'Специфікація',
  model: '3D-модель',
  schematic: 'Схема',
  instructions: 'Інструкція',
  test: 'Протокол випробувань',
  other: 'Інший документ',
  editDocument: 'Дані документа',
  documentRevision: 'Ревізія документа',
  deleteDocument: 'Видалення документа',
  deleteDocumentText:
    'Посилання на файл буде прибрано з поточної гілки та залишиться у збережених версіях. Сам файл на диску залишається на місці.',
  exportTitle: 'Експорт проєкту',
  exportDescription:
    'Пакет містить гілки, версії, посилання на файли й виробничі записи. Реальні інженерні файли передавайте окремо.',
  zipExport: 'ZIP · Опис та інструменти',
  jsonExport: 'JSON · Переносний формат',
  bomExport: 'CSV · Специфікація',
  bomExportText:
    'Склад поточної гілки з підсумковими кількостями та місцями виготовлення.',
  exported: 'Експорт готовий',
  importing: 'Імпортуємо…',
  imported: 'Проєкт імпортовано',
  importSameTitle: 'Цей проєкт уже є у просторі',
  importSameText:
    'Оберіть, як додати файл від іншого інженера. Наявні зміни збережуться.',
  importHistory: 'Додати гілки та історію',
  importHistoryText:
    'Імпортовані гілки з’являться з префіксом incoming/. Потім їх можна об’єднати.',
  importCopy: 'Відкрити окрему копію',
  importCopyText: 'Створити незалежний проєкт з новим ідентифікатором.',
  historyImported: 'Історію та гілки додано',
  nothingToImport: 'Нових версій або гілок немає',
  fileIntegrity: 'Вміст файлів перевіряється за SHA-256.',
  fileMetadata: 'Відомості про файл',
  hashError: 'Перевірка вмісту файлу SHA-256 не пройдена. Імпорт відхилено.',
  downloadArchive: 'Зберегти ZIP',
  noFilesForComponent: 'До цього компонента файли ще не додані.',
  documentsFor: 'Документи для',
  chooseFileTarget: 'Додати файли до',
  importUpdate: 'Додати зміни з JSON / ZIP',
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
  filePathError:
    'Вкажіть унікальний відносний шлях із /. Не використовуйте .., зарезервовані назви й однаковий шлях для файлу та каталогу.',
  verificationReportError:
    'Ця перевірка не відповідає поточному проєкту. Сформуйте й запустіть його актуальний скрипт перевірки.',
  guideFileImageHelp:
    'Оберіть локальне зображення PNG, JPEG, WebP, GIF або SVG. HTML-звіт показує його за відносним шляхом. Зображення залишається на диску.',
  guideFileImageExample: 'components/P.001.101/rev-A/preview.png',
  guideFileImageExample2: 'components/P.001.101/rev-A/photo.jpg',
  guideFileImageExample3: 'components/P.001.101/rev-A/assembly-view.svg',
  guideFileImageRule:
    'Збережіть report.html у корені проєкту, щоб шляхи до зображень відкривалися правильно.',
  reportParent: 'Батьківський вузол',
  metadataPackageOnly:
    'Імпортуйте project.json або пакет опису. Реальні інженерні файли передавайте окремо.',
  fileCheckUnavailable:
    'Не вдалося порівняти перевірку; повторіть у браузері з підтримкою локальної криптографії',
  searchDocuments: 'Знайти документ…',
  allDocuments: 'Усі документи',
  snapshotFiles: 'Файли цієї версії',
  filesImported: 'Файли з архіву додано',
  kind: 'Тип документа',
  size: 'Розмір',
  path: 'Шлях файлу',
  jsonExportText:
    'Один легкий файл: структура, шляхи, маршрути, історія та результати виробництва.',
  zipExportText:
    'JSON, скрипти, специфікація та локальний HTML-звіт. Інженерні файли передаються окремо.',
  noDocumentsText:
    'Додайте відносні шляхи до потрібних креслень, моделей і зображень.',
};
