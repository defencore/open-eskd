export default {
  verificationLatestExample: 'Відкрити оновлений приклад',
  verificationOlderExample:
    'Цей збережений приклад створений до появи журналу випробувань. Відкрийте оновлений приклад окремим проєктом; ваша копія та зміни залишаться доступними.',
  verification: 'Журнал випробувань',
  verificationSubtitle:
    'Зберігайте кожну спробу, її точну конфігурацію та всі пов’язані докази разом.',
  newVerificationRun: 'Записати випробування',
  verificationJournalHint:
    'Один тестовий випадок може мати багато спроб. Кожна зберігає власну конфігурацію, результат і набір відео, логів, протоколів та даних. Файли залишаються у ваших каталогах проєкту.',
  verificationRunsCount: 'спроб випробувань',
  verificationArtifacts: 'Файли доказів',
  verificationAll: 'Усі',
  verificationSearch:
    'Пошук випадків, компонентів, приміток або шляхів доказів',
  verificationArtifactSearch: 'Пошук назви, шляху, приміток або SHA-256 доказу',
  verificationRun: 'Спроба випробування',
  verificationOpenRun: 'Відкрити спробу',
  verificationMore: 'Показати більше спроб',
  verificationMoreArtifacts: 'Показати більше файлів доказів',
  verificationEmpty: 'Випробування ще не записані',
  verificationEmptyDescription:
    'Збережіть версію проєкту, потім запишіть спробу з результатом і потрібною кількістю посилань на докази. Кожна наступна спроба стає окремим записом.',
  verificationBack: 'До журналу випробувань',
  verificationRetest: 'Записати повторну перевірку',
  verificationRetestLabel: 'Повторна перевірка',
  verificationRetestOf: 'Повторна перевірка спроби',
  verificationLaterRetests: 'Наступні повторні перевірки',
  verificationImmutableHint:
    'Збережена спроба залишається історичним записом. Для нового результату запишіть іншу спробу або повторну перевірку; попередній результат і докази залишаться незмінними. Результати випробувань не змінюють виробничі кількості.',
  verificationNoArtifacts: 'Відповідні файли доказів відсутні',
  verificationNoArtifactsDescription:
    'Очистіть пошук або оберіть інший тип файла. У спробі також можна явно зафіксувати, що докази не були зібрані.',
  verificationGlobalScope: 'Уся збережена конфігурація',
  verificationAnyOperation: 'Без окремої операції',
  verificationRecordHint:
    'Запишіть одну фактичну спробу, а не всю кампанію випробувань. Нижче зберіть шляхи до її відео, логів і протоколів. Збережена конфігурація та набір доказів залишаться разом в історії.',
  verificationSavedOnlyHint:
    'Оберіть версію, яку фактично перевіряли. Незбережені робочі зміни не включаються. Виробнича партія використовує початкову зафіксовану конфігурацію.',
  verificationRecordRun: 'Зберегти спробу',
  verificationName: 'Назва спроби',
  verificationCase: 'ID тестового випадку',
  verificationPerformedAt: 'Коли виконано',
  verificationConfiguration: 'Випробувана конфігурація',
  verificationComponent: 'Випробуваний компонент',
  verificationOperation: 'Пов’язана операція',
  verificationProcedure: 'Шлях до процедури',
  verificationOperator: 'Виконавець / рецензент',
  verificationOutcome: 'Результат',
  verificationSummary: 'Результат і спостереження',
  verificationEvidencePaths: 'Шляхи доказів — по одному в рядку',
  verificationEvidenceKind: 'Тип доказу',
  verificationEvidenceTitle: 'Назва доказу',
  verificationEvidenceRequired: 'Очікувана наявність файла',
  verificationEvidenceNotes: 'Примітки до доказу',
  verificationEvidenceMetadata: 'Назва, обов’язковість, хеш і примітки',
  verificationBulkHint:
    'Вставте одразу кілька відносних шляхів. Типи пропонуються за розширеннями; розгорніть файл, щоб уточнити назву, обов’язковість, необов’язковий хеш і примітки. Вміст файлів не завантажується.',
  verificationAutoKind: 'Визначити за розширенням',
  verificationAddPaths: 'Додати ці шляхи',
  verificationEvidenceLimit: 'Одна спроба підтримує до 1 000 файлів доказів.',
  verificationDuplicatePath:
    'Кожен шлях доказу має траплятися лише один раз у спробі.',
  verificationArtifactKind_video: 'Відео',
  verificationArtifactKind_log: 'Лог',
  verificationArtifactKind_protocol: 'Протокол / звіт',
  verificationArtifactKind_image: 'Зображення',
  verificationArtifactKind_dataset: 'Набір даних',
  verificationArtifactKind_other: 'Інше',
  verificationOutcome_passed: 'Успішно',
  verificationOutcome_failed: 'Невдало',
  verificationOutcome_blocked: 'Заблоковано',
  verificationOutcome_inconclusive: 'Недостатньо даних',
  guideVerificationNameHelp:
    'Коротка назва, яка визначає саме цю спробу в кампанії випробувань.',
  guideVerificationNameExample: 'Перевірка інтерфейсу · перша спроба',
  guideVerificationNameExample2: 'Відтворення ПЗ · випуск 1.2.0 · спроба 3',
  guideVerificationNameExample3:
    'Замінний кронштейн · контроль після доопрацювання',
  guideVerificationNameRule:
    'Кожну спробу записуйте окремо. Сталий ідентифікатор випадку вказуйте в полі ID тестового випадку, а тут опишіть конкретну спробу.',
  guideVerificationCaseHelp:
    'Сталий ідентифікатор перевірки вимоги або тестового випадку. Кілька спроб можуть мати один ідентифікатор.',
  guideVerificationCaseExample: 'COM-003',
  guideVerificationCaseExample2: 'SW-RESTORE-014',
  guideVerificationCaseExample3: 'INSPECT-BRACKET-002',
  guideVerificationCaseRule:
    'Для повторної перевірки використовуйте той самий ID випадку. ID спроби генерується окремо, тому спроби не перезаписують одна одну.',
  guideVerificationPerformedAtHelp:
    'Час фактичної спроби, який відображається й вводиться у вашому місцевому часовому поясі.',
  guideVerificationPerformedAtExample: '18 жовтня 2026, 14:30',
  guideVerificationPerformedAtExample2: 'Час фактичного контрольного огляду',
  guideVerificationPerformedAtExample3:
    'Повторна перевірка завтра → нова дата й спроба',
  guideVerificationPerformedAtRule:
    'Записуйте час події, а не дату з назви файла. Проєкт зберігає явний час UTC для обміну між часовими поясами.',
  guideVerificationConfigurationHelp:
    'Незмінна версія проєкту або видана виробнича партія, яка точно визначає об’єкт перевірки.',
  guideVerificationConfigurationExample:
    '0.3.0-interface-b · збережена конфігурація main',
  guideVerificationConfigurationExample2:
    'MVP-001 · зафіксована конфігурація телеметрії A',
  guideVerificationConfigurationExample3:
    '0.2.1-ground-variant · альтернативна наземна станція',
  guideVerificationConfigurationRule:
    'Перед записом спроби збережіть потрібну конфігурацію. Пізніша ревізія не переписує попередні спроби чи зафіксовану партію. Для кожної повторної перевірки обирайте фактично перевірену конфігурацію.',
  guideVerificationComponentHelp:
    'Входження компонента в обраній випробуваній конфігурації або вся конфігурація, якщо перевірка ширша.',
  guideVerificationComponentExample: 'ATL.400.000 · Підсистема зв’язку',
  guideVerificationComponentExample2: 'SW.140.010 · Випуск прошивки 1.2.0',
  guideVerificationComponentExample3:
    'Уся збережена конфігурація · інтеграційний розгляд',
  guideVerificationComponentRule:
    'Обирайте із випробуваної базової конфігурації, а не сьогоднішнього робочого дерева. Компонент може мати кілька входжень — перевірте батьківський шлях. Повторні перевірки зберігають той самий компонент.',
  guideVerificationOperationHelp:
    'Операція виготовлення, контролю чи випробування, пов’язана зі спробою, якщо така є.',
  guideVerificationOperationExample:
    '4. Випробування · стендовий маршрут зв’язку',
  guideVerificationOperationExample2:
    '1. Підготовка · контроль ідентифікації заготовки',
  guideVerificationOperationExample3:
    'Без окремої операції · незалежний розгляд',
  guideVerificationOperationRule:
    'Оберіть операцію обраного компонента у випробуваній базовій конфігурації. Запис випробування автоматично не приймає виробничу операцію.',
  guideVerificationProcedureHelp:
    'Переносимий відносний шлях до контрольованої процедури, плану або критеріїв приймання для цієї спроби.',
  guideVerificationProcedureExample: 'verification/procedures/COM-003_B.pdf',
  guideVerificationProcedureExample2: 'verification/software/restore-plan_A.md',
  guideVerificationProcedureExample3: 'documentation/inspection/bracket_A.pdf',
  guideVerificationProcedureRule:
    'Використовуйте прямі слеші від кореня проєкту. Уникайте абсолютних системних шляхів, переходів до батьківських каталогів і вебадрес. Процедура перевіряється як очікуваний файл у згенерованих перевірках.',
  guideVerificationOperatorHelp:
    'Людина або команда, яка виконала, засвідчила чи записала спробу за вашим процесом.',
  guideVerificationOperatorExample: 'Олексій Коваль · Контрольна лабораторія',
  guideVerificationOperatorExample2: 'Команда перевірки ПЗ · рецензент 02',
  guideVerificationOperatorExample3: 'Дільниця 3 · вхідний контроль',
  guideVerificationOperatorRule:
    'Укажіть фактичного відповідального виконавця чи рецензента. Поле фіксує авторство; повноваження погодження організація визначає окремо.',
  guideVerificationOutcomeHelp:
    'Висновок цієї спроби щодо визначеної процедури та конфігурації.',
  guideVerificationOutcomeExample: 'Успішно · усі перевірені критерії виконані',
  guideVerificationOutcomeExample2:
    'Невдало · невідповідність ідентифікації; потрібна повторна перевірка',
  guideVerificationOutcomeExample3:
    'Заблоковано · відсутній вхідний елемент; Недостатньо даних · доказів замало',
  guideVerificationOutcomeRule:
    'Обирайте Недостатньо даних, якщо докази не обґрунтовують успіх чи невдачу. Зберігайте невдалі спроби та пов’язуйте нову повторну перевірку. Результат не змінює виробничі прийняті чи забраковані кількості.',
  guideVerificationSummaryHelp:
    'Фактичні спостереження, критерії приймання, відхилення й рішення, потрібні для розуміння спроби.',
  guideVerificationSummaryExample:
    'Випадок COM-003: одне позначення інтерфейсу відрізняється від контрольованої матриці. Дивіться протокол та обидва журнали спостерігачів.',
  guideVerificationSummaryExample2:
    'Розгляд відновлення завершений для збереженого варіанта станції; ідентифікатори набору даних і маніфесту збігаються.',
  guideVerificationSummaryExample3:
    'Заблоковано: запис приймання постачальника ще не отримано. Виконання випробування чи приймання не підтверджується.',
  guideVerificationSummaryRule:
    'Укажіть, що перевірено й що залишається відкритим. Посилайтеся на зареєстровані шляхи доказів. Відрізняйте фактичні спостереження від очікувань і запланованих робіт.',
  guideVerificationEvidencePathsHelp:
    'По одному відносному шляху в рядку. Одна спроба може містити багато відео, журналів пристроїв, протоколів, фотографій і наборів даних.',
  guideVerificationEvidencePathsExample:
    'verification/RUN-001/video/camera-01_part-01.mp4',
  guideVerificationEvidencePathsExample2:
    'verification/RUN-001/logs/controller.log',
  guideVerificationEvidencePathsExample3: 'verification/RUN-001/protocol.pdf',
  guideVerificationEvidencePathsRule:
    'Вставте до 1 000 різних шляхів для цієї спроби. Файли залишаються у вашій системі. Додайте шляхи, перевірте запропоновані типи й метадані; зберігайте, коли набір доказів підготовлений.',
  guideVerificationEvidenceKindHelp:
    'Призначення файла доказу для фільтрування великої колекції.',
  guideVerificationEvidenceKindExample: 'Відео · camera-02_part-04.mp4',
  guideVerificationEvidenceKindExample2: 'Лог · device-output.jsonl',
  guideVerificationEvidenceKindExample3:
    'Протокол / звіт · signed-inspection.pdf',
  guideVerificationEvidenceKindRule:
    'Автоматичне визначення — початкова пропозиція. Для неоднозначного розширення оберіть призначення явно; зміна типу не перейменовує й не змінює файл.',
  guideVerificationEvidenceTitleHelp:
    'Зрозуміла назва, яка пояснює внесок цього файла в докази спроби.',
  guideVerificationEvidenceTitleExample: 'Камера 2 · огляд стенда · сегмент 04',
  guideVerificationEvidenceTitleExample2:
    'Потік подій контролера · часовий орієнтир спостерігача',
  guideVerificationEvidenceTitleExample3:
    'Протокол контролю · початкова забракована заготовка',
  guideVerificationEvidenceTitleRule:
    'Спочатку пропонується назва файла. Додайте ідентифікацію камери чи пристрою, ракурс або сегмент, щоб розрізняти багато схожих файлів.',
  guideVerificationEvidenceRequiredHelp:
    'Чи має файл бути присутнім під час перевірки структури проєкту.',
  guideVerificationEvidenceRequiredExample:
    'Обов’язковий · завершений протокол контролю',
  guideVerificationEvidenceRequiredExample2:
    'Обов’язковий · оригінальний журнал контролера',
  guideVerificationEvidenceRequiredExample3:
    'Необов’язковий · запланована відеозаглушка без запису',
  guideVerificationEvidenceRequiredRule:
    'Обов’язковий означає очікуваний файл, а не погоджений результат. Відсутні необов’язкові матеріали не слід описувати як записані чи переглянуті докази.',
  guideVerificationEvidenceNotesHelp:
    'Контекст для розуміння саме цього доказу без здогадок із назви файла.',
  guideVerificationEvidenceNotesExample:
    'Камера 2; сегмент 04; використовуйте опорну мітку з протоколу.',
  guideVerificationEvidenceNotesExample2:
    'Журнал спостерігача; часові мітки за годинником станції, вказаним у протоколі.',
  guideVerificationEvidenceNotesExample3:
    'Лише заплановане оглядове фото; файл ще не знято й не переглянуто.',
  guideVerificationEvidenceNotesRule:
    'За потреби опишіть джерело, ракурс, сегмент, часовий орієнтир та обмеження. Наявність файла чи збіг хешу не замінюють інженерної перевірки.',
};
