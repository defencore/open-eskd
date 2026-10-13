import { inspect } from 'node:util';

export default async function* githubTestReporter(events) {
  for await (const { type, data } of events) {
    if (type !== 'test:fail') continue;
    const message = `${data.name}\n${inspect(data.details.error, { depth: 6 })}`;
    const escaped = message
      .replaceAll('%', '%25')
      .replaceAll('\r', '%0D')
      .replaceAll('\n', '%0A');
    yield `::error title=Filesystem test failure::${escaped}\n`;
  }
}
