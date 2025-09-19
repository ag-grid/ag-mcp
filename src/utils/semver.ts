type SemverType = {
    major: number,
    minor: number,
    patch: number
}

const eq = (a: SemverType, b: SemverType) => {
    return a.major === b.major && a.minor === b.minor && a.patch === b.patch;
}

const gt = (a: SemverType, b: SemverType) => {
    if (a.major !== b.major) return a.major > b.major;
    if (a.minor !== b.minor) return a.minor > b.minor;
    return a.patch > b.patch;
}

const lt = (a: SemverType, b: SemverType) => {
    if (a.major !== b.major) return a.major < b.major;
    if (a.minor !== b.minor) return a.minor < b.minor;
    return a.patch < b.patch;
}

const between = (a: SemverType, start: SemverType, end: SemverType) => {
    return gt(a, start) && lt(a, end);
}

const parse = (version: string): SemverType => {
    const match = version.match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
    if (!match) {
        throw new Error(`Invalid semver version: ${version}`);
    }
    
    return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2] || '0', 10),
        patch: parseInt(match[3] || '0', 10)
    };
}

const generateMajorVersionPath = (from: string, to: string): number[] => {
    const fromVer = parse(from);
    const toVer = parse(to);
    
    const path: number[] = [];
    for (let major = fromVer.major + 1; major <= toVer.major; major++) {
        path.push(major);
    }
    
    return path;
}

export const Semver = {
    eq, gt, lt, between, parse, generateMajorVersionPath
}