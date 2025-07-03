import { describe, it, expect } from '@ohos/hypium';
import { abilityDelegatorRegistry, Driver, ON } from '@kit.TestKit';
import { hilog } from '@kit.PerformanceAnalysisKit';

const delegator: abilityDelegatorRegistry.AbilityDelegator =
  abilityDelegatorRegistry.getAbilityDelegator()
const bundleName = abilityDelegatorRegistry.getArguments().bundleName;

function sleep(time: number) {
  return new Promise<void>((resolve: Function) => setTimeout(resolve, time));
}

function openTesterinoPage(pageName: string) {
  return async (done: Function) => {
    await delegator.startAbility({
      bundleName: bundleName,
      abilityName: 'EntryAbility'
    });
    await sleep(5000);
    const topAbility = await delegator.getCurrentTopAbility()
    expect(topAbility.context.abilityInfo.name).assertEqual('EntryAbility');

    const driver = Driver.create();
    const button =
      await driver.waitForComponent(ON.text(pageName), 30000)
    await button.click();

    hilog.info(0xFF00, "TestTag", "waiting for at least 1 test pass")
    let passTestsCount = 0;
    while (passTestsCount === 0) {
      passTestsCount =
        parseInt(await (await driver.waitForComponent(ON.id("TESTERINO_PASS_VALUE"),
          30000)).getText())
      await sleep(500);
    }
    
    hilog.info(0xFF00, "TestTag", "waiting for all tests to finish")
    if (await driver.findComponent(ON.id("TESTERINO_RUNNING_VALUE"))) {
      // for concurrent test, wait for running test to reduce to zero
      let runningTestsCount = 999;
      while (runningTestsCount > 0) {
        runningTestsCount =
          parseInt(await (await driver.waitForComponent(ON.id("TESTERINO_RUNNING_VALUE"), 10000)).getText())
        await sleep(500);
      }
    } else {
      // for sequential test, wait for finished test count to be stable
      let prevFinished = 0;
      let currentFinished = 0;
      do {
        prevFinished = currentFinished;
        await sleep(10000);
        currentFinished =
          parseInt(await (await driver.waitForComponent(ON.id("TESTERINO_FINISHED_VALUE"), 10000)).getText())
      } while (currentFinished != prevFinished)
    }
    
    hilog.info(0xFF00, "TestTag", "get failed results")
    const failedTestsCount =
      parseInt(await (await driver.waitForComponent(ON.id("TESTERINO_FAIL_VALUE"), 10000)).getText())
    const brokenTestsCount =
      parseInt(await (await driver.waitForComponent(ON.id("TESTERINO_BROKEN_VALUE"), 10000)).getText())
    
    expect(failedTestsCount).assertEqual(0)
    expect(brokenTestsCount).assertEqual(0)
    expect(passTestsCount > 0).assertEqual(true)

    hilog.info(0xFF00, "TestTag", "back to homepage")
    let backButton = await driver.waitForComponent(ON.id("TOP_BACK_BUTTON"), 10000);
    await backButton.click();

    done();
  };
}

export default function abilityTest() {
  describe('tester', () => {
    it('runs sequential tester with no broken or failed test',
      0, openTesterinoPage("SEQUENTIAL TESTER [driver required]"));
    // Keep the concurrent tester at the last. It can be very slow to navigate 
    // back from.
    it('runs concurrent tester with no broken or failed test',
      0, openTesterinoPage("CONCURRENT TESTER"));
  })
}
