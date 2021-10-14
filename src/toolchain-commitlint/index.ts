import { chain, mergeWith, noop, Rule, Tree, url } from '@angular-devkit/schematics';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import debugLib from 'debug';
import { cyan } from 'colorette';
import { latestVersions } from '../shared/latest-versions';
import { IToolchainCommitlintOptions } from './schema';
import { addTask } from '../toolchain-husky/utility';
import { camelCasedOptions } from '../shared';

const debug = debugLib('@wyntau/schematics:toolchain-commitlint');

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function toolchainCommitlint(_options: IToolchainCommitlintOptions): Rule {
  const options = camelCasedOptions(_options);
  return chain([
    mergeWith(url('./files')),
    function (tree: Tree) {
      const packageNames = ['@commitlint/cli', '@commitlint/config-conventional'];

      packageNames.forEach((packageName) => {
        const packageVersion = latestVersions[packageName];

        debug(`get ${cyan(packageName)} version: %s`, cyan(packageVersion));

        addPackageJsonDependency(tree, {
          type: NodeDependencyType.Dev,
          name: packageName,
          version: packageVersion,
        });
      });

      return tree;
    },
    options.toolchainHusky ? addTask('commit-msg', 'npx commitlint') : noop(),
  ]);
}
