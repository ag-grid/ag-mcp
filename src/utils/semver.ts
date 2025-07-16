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

export const Semver = {
    eq, gt, lt, between
}