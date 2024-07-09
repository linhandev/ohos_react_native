import { setupRNOHWorker } from "@rnoh/react-native-openharmony/ts"
import { createRNPackages } from "../RNPackagesFactory"

setupRNOHWorker({ defaultThirdPartyPackagesFactory: createRNPackages })