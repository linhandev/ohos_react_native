import { AbsolutePath, maybeReadFile } from '../core';
import { Command } from './types';
import JSON5 from 'json5';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import * as crypto from 'node:crypto';

const COMMAND_NAME = 'clean-harmony';
export const commandCleanHarmony: Command = {
    name: COMMAND_NAME,
    description: 'Remove cached files in the OpenHarmony project.',
    options: [
        {
            name: "--harmony-project-path <path>",
            description: "Specifies the root of your OpenHarmony project.",
            default: "./harmony"
        }
    ],
    func: async (_argv, _config, rawArgs: any) => {
        const harmonyProjectPath = new AbsolutePath(rawArgs.harmonyProjectPath);
        const md5Path = crypto.createHash("md5").update(harmonyProjectPath.getValue()).digest("hex");
        const hvigorCachePath = new AbsolutePath(path.join(os.homedir(), ".hvigor", "project_caches", md5Path));

        if (fs.existsSync(hvigorCachePath.getValue())) {
            fs.rmSync(hvigorCachePath.getValue(), { recursive: true, force: true });
        }

        const buildProfilePath = harmonyProjectPath.copyWithNewSegment('build-profile.json5');
        const buildProfileContent = maybeReadFile(buildProfilePath);

        if (buildProfileContent) {
            const buildProfile = JSON5.parse(buildProfileContent);

            if (Array.isArray(buildProfile.modules)) {
                buildProfile.modules.forEach((module: any) => {
                    if (module && module.srcPath) {
                        const modulePath =  harmonyProjectPath.copyWithNewSegment(module.srcPath);
                        const cxxPath = modulePath.copyWithNewSegment('.cxx');
                        const buildPath = modulePath.copyWithNewSegment('build');

                        if (fs.existsSync(cxxPath.getValue())) {
                            fs.rmSync(cxxPath.getValue(), { recursive: true, force: true });
                        }

                        if (fs.existsSync(buildPath.getValue())) {
                            fs.rmSync(buildPath.getValue(), { recursive: true, force: true });
                        }
                    }
                });
            }
        }
    }
};