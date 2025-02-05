import { describe, it, expect } from '@ohos/hypium';
import { abilityDelegatorRegistry, Driver, ON } from '@kit.TestKit';

const delegator: abilityDelegatorRegistry.AbilityDelegator = abilityDelegatorRegistry.getAbilityDelegator()
const bundleName = abilityDelegatorRegistry.getArguments().bundleName;

function sleep(time: number) {
  return new Promise<void>((resolve: Function) => setTimeout(resolve, time));
}

export default function abilityTest() {
  describe('tester', () => {
    it('should navigate to the page with automatic and manual page, wait for test to resolve and there should be no failing tests',
      0, async (done: Function) => {
        await delegator.startAbility({
          bundleName: bundleName,
          abilityName: 'EntryAbility'
        });
        await sleep(5000);
        const topAbility = await delegator.getCurrentTopAbility()
        expect(topAbility.context.abilityInfo.name).assertEqual('EntryAbility');

        const driver = Driver.create();
        const button = await driver.waitForComponent(ON.text("AUTOMATED & MANUAL TESTS"), 10000)
        await button.click();

        // wait for total tests count be greater than 0
        let totalTestsCount = 0;
        while (totalTestsCount === 0) {
          totalTestsCount =
            parseInt(await (await driver.waitForComponent(ON.id("TESTERINO_TOTAL_VALUE"), 10000)).getText())
          await sleep(500);
        }

        // wait for all tests to finish
        let runningTestsCount = 999;
        while (runningTestsCount > 0) {
          runningTestsCount =
            parseInt(await (await driver.findComponent(ON.id("TESTERINO_RUNNING_VALUE"))).getText())
          await sleep(500);
        }

        const failedTestsCount = parseInt(await (await driver.findComponent(ON.id("TESTERINO_FAIL_VALUE"))).getText())
        const brokenTestsCount = parseInt(await (await driver.findComponent(ON.id("TESTERINO_BROKEN_VALUE"))).getText())

        expect(runningTestsCount).assertEqual(0)
        expect(failedTestsCount).assertEqual(0)
        expect(brokenTestsCount).assertEqual(0)
        expect(totalTestsCount > 0).assertEqual(true)
        done();
      })
  })
}
