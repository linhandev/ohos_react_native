import { ReactNativeFixture } from './ReactNativeFixture';

it('should mention command and argument names in the help description', async () => {
  const result = new ReactNativeFixture('.').runHarmony({ help: true });

  expect(result.includes('run-harmony')).toBeTruthy();
  expect(result.includes('harmony-project-path')).toBeTruthy();
  expect(result.includes('module')).toBeTruthy();
  expect(result.includes('build-mode')).toBeTruthy();
  expect(result.includes('product')).toBeTruthy();
  expect(result.includes('ability')).toBeTruthy();
});
