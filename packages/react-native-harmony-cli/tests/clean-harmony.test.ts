import { ReactNativeFixture } from './ReactNativeFixture';

it('should list clean-harmony in the help description', async () => {
  const result = new ReactNativeFixture('.').help();

  expect(result.includes('clean-harmony')).toBeTruthy();
});
