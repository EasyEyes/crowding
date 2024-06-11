/* ----------------------------- Condition Name ----------------------------- */

import { paramReader } from "../threshold";
import {
  conditionNameConfig,
  font,
  letterConfig,
  readingPageStats,
  showConditionNameConfig,
  viewingDistanceCm,
} from "./global";
import { logger, toFixedNumber } from "./utils";

export const showConditionName = (conditionName, targetSpecs) => {
  if (showConditionNameConfig.show) {
    conditionName.setText(showConditionNameConfig.name);

    updateConditionNameConfig(
      conditionNameConfig,
      showConditionNameConfig.showTargetSpecs,
      targetSpecs,
    );
    conditionName.setPos(conditionNameConfig.pos);

    conditionName.setAutoDraw(true);
  }
};

export const updateConditionNameConfig = (
  conditionNameConfig,
  updateForTargetSpecs,
  targetSpecs = null,
) => {
  if (updateForTargetSpecs && targetSpecs) {
    conditionNameConfig.pos[0] = -window.innerWidth / 2;
    conditionNameConfig.pos[1] =
      -window.innerHeight / 2 + targetSpecs.getBoundingBox().height;
  } else {
    conditionNameConfig.pos[0] = -window.innerWidth / 2;
    conditionNameConfig.pos[1] = -window.innerHeight / 2;
  }
};

/* -------------------------------------------------------------------------- */

export const updateTargetSpecsForLetter = (
  stimulusParameters,
  experimentFilename,
) => {
  const specs = {
    filename: experimentFilename,
    sizeDeg: stimulusParameters.sizeDeg,
    heightDeg: stimulusParameters.heightDeg,
    heightPx: stimulusParameters.heightPx,
    font: font.name,
    spacingRelationToSize: letterConfig.spacingRelationToSize,
    spacingOverSizeRatio: letterConfig.spacingOverSizeRatio,
    spacingSymmetry: letterConfig.spacingSymmetry,
    targetDurationSec: letterConfig.targetDurationSec,
    targetSizeIsHeightBool: letterConfig.targetSizeIsHeightBool,
    targetEccentricityXYDegs: letterConfig.targetEccentricityXYDeg,
    viewingDistanceCm: viewingDistanceCm.current,
  };
  if (stimulusParameters.spacingDeg !== undefined)
    specs["spacingDeg"] = stimulusParameters.spacingDeg;
  showConditionNameConfig.targetSpecs = enumerateProvidedTargetSpecs(specs);
};

export const updateTargetSpecsForMovie = (paramReader, BC) => {
  const specs = {
    targetEccentricityXDeg: paramReader.read("targetEccentricityXDeg", BC),
    targetEccentricityYDeg: paramReader.read("targetEccentricityYDeg", BC),
    targetContrast: paramReader.read("targetContrast", BC),
    targetCyclePerDeg: paramReader.read("targetCyclePerDeg", BC),
    targetHz: paramReader.read("targetHz", BC),
    thresholdParameter: paramReader.read("thresholdParameter", BC),
  };
  showConditionNameConfig.targetSpecs = enumerateProvidedTargetSpecs(specs);
};

export const updateTargetSpecsForRepeatedLetters = (
  stimulusParameters,
  experimentFilename,
) => {
  const { stimulusLocations, ...stimulusParametersToShow } = stimulusParameters;
  const specs = Object.assign(
    {
      filename: experimentFilename,
      spacingRelationToSize: letterConfig.spacingRelationToSize,
      spacingOverSizeRatio: letterConfig.spacingOverSizeRatio,
      targetSizeIsHeightBool: letterConfig.targetSizeIsHeightBool,
      viewingDistanceCm: viewingDistanceCm.current,
    },
    stimulusParametersToShow,
  );
  showConditionNameConfig.targetSpecs = enumerateProvidedTargetSpecs(specs);
};

export const updateTargetSpecsForReading = (reader, BC, experimentFilename) => {
  const specs = {
    filename: experimentFilename,
    readingCorpus: reader.read("readingCorpus", BC),
    readingFirstFewWords: readingPageStats.readingPageSkipCorpusWords.length
      ? readingPageStats.readingPageSkipCorpusWords[
          readingPageStats.readingPageSkipCorpusWords.length - 1
        ]
      : 0,
    readingDefineSingleLineSpacingAs: reader.read(
      "readingDefineSingleLineSpacingAs",
      BC,
    ),
    font: reader.read("font", BC),
    readingLinesPerPage: reader.read("readingLinesPerPage", BC),
    readingLineLengthUnit: reader.read("readingLineLengthUnit", BC),
    readingLineLength: reader.read("readingLineLength", BC),
    readingMultipleOfSingleLineSpacing: reader.read(
      "readingMultipleOfSingleLineSpacing",
      BC,
    ),
    readingNominalSizeDeg: reader.read("readingNominalSizeDeg", BC),
    readingNumberOfPossibleAnswers: reader.read(
      "readingNumberOfPossibleAnswers",
      BC,
    ),
    readingNumberOfQuestions: reader.read("readingNumberOfQuestions", BC),
    readingSetSizeBy: reader.read("readingSetSizeBy", BC),
    readingSingleLineSpacingDeg: reader.read("readingSingleLineSpacingDeg", BC),
    readingSpacingDeg: reader.read("readingSpacingDeg", BC),
    readingXHeightDeg: reader.read("readingXHeightDeg", BC),
    readingXHeightPt: reader.read("readingXHeightPt", BC),
    readingNominalSizePt: reader.read("readingNominalSizePt", BC),
    viewingDistanceCm: viewingDistanceCm.current,
  };
  showConditionNameConfig.targetSpecs = enumerateProvidedTargetSpecs(specs);
};

export const updateTargetSpecsForSound = (
  targetLevel,
  maskerLevel,
  soundGain,
  noiseLevel,
  targetSoundFolder,
  maskerSoundFolder,
) => {
  const specs = {
    targetLevel: toFixedNumber(targetLevel, 1),
    maskerLevel: maskerLevel,
    soundGainDBSPL: soundGain,
    noiseLevel: noiseLevel, // noiseLevelDBSPL? why is it named differently from in soundDetect, soundIdent?
    targetSoundFolder: targetSoundFolder,
    maskerSoundFolder: maskerSoundFolder,
  };
  showConditionNameConfig.targetSpecs = enumerateProvidedTargetSpecs(specs);
};

export const updateTargetSpecsForRsvpReading = (
  reader,
  BC,
  experimentFilename,
  otherSpecs,
) => {
  const readingSpecs = {
    filename: experimentFilename,
    readingCorpus: reader.read("readingCorpus", BC),
    readingFirstFewWords: readingPageStats.readingPageSkipCorpusWords.length
      ? readingPageStats.readingPageSkipCorpusWords[
          readingPageStats.readingPageSkipCorpusWords.length - 1
        ]
      : 0,
    readingDefineSingeLineSpacingAs: reader.read(
      "readingDefineSingleLineSpacingAs",
      BC,
    ),
    font: reader.read("font", BC),
    readingMultipleOfSingleLineSpacing: reader.read(
      "readingMultipleOfSingleLineSpacing",
      BC,
    ),
    readingNominalSizeDeg: reader.read("readingNominalSizeDeg", BC),
    readingSetSizeBy: reader.read("readingSetSizeBy", BC),
    readingSingleLineSpacingDeg: reader.read("readingSingleLineSpacingDeg", BC),
    readingSpacingDeg: reader.read("readingSpacingDeg", BC),
    readingXHeightDeg: reader.read("readingXHeightDeg", BC),
    readingXHeightPt: reader.read("readingXHeightPt", BC),
    readingNominalSizePt: reader.read("readingNominalSizePt", BC),
    viewingDistanceCm: viewingDistanceCm.current,
  };
  const rsvpSpecs = {
    rsvpReadingFlankTargetWithLettersBool: reader.read(
      "rsvpReadingFlankTargetWithLettersBool",
      BC,
    ),
    rsvpReadingFlankerCharacterSet: reader.read(
      "rsvpReadingFlankerCharacterSet",
      BC,
    ),
    rsvpReadingNumberOfResponseOptions: reader.read(
      "rsvpReadingNumberOfResponseOptions",
      BC,
    ),
    rsvpReadingNumberOfWords: reader.read("rsvpReadingNumberOfWords", BC),
    rsvpReadingRequireUniqueWordsBool: reader.read(
      "rsvpReadingRequireUniqueWordsBool",
      BC,
    ),
  };
  const allSpecs = Object.assign(readingSpecs, rsvpSpecs, otherSpecs);
  showConditionNameConfig.targetSpecs = enumerateProvidedTargetSpecs(allSpecs);
};

export const updateTargetSpecsForSoundDetect = (
  targetLevel,
  maskerLevel,
  soundGain,
  noiseLevel,
  targetSoundFolder,
  maskerSoundFolder,
) => {
  const specs = {
    targetSoundDBSPL: targetLevel,
    maskerSoundDBSPL: maskerLevel,
    soundGainDBSPL: soundGain,
    noiseSoundDBSPL: noiseLevel,
    targetSoundFolder: targetSoundFolder,
    maskerSoundFolder: maskerSoundFolder,
  };
  showConditionNameConfig.targetSpecs = enumerateProvidedTargetSpecs(specs);
};

export const updateTargetSpecsForSoundIdentify = (
  targetLevel,
  soundGain,
  noiseLevel,
  targetSoundFolder,
) => {
  const specs = {
    targetSoundDBSPL: targetLevel,
    soundGainDBSPL: soundGain,
    noiseSoundDBSPL: noiseLevel,
    targetSoundFolder: targetSoundFolder,
  };
  showConditionNameConfig.targetSpecs = enumerateProvidedTargetSpecs(specs);
};

export const isTimingOK = (measured, target) => {
  return measured < target ? "OK" : "BAD";
};

/**
 * Given an object, create a string enumerating each of the objects properties with one property per line.
 * @param {object} specs
 * @returns {string}
 */
const enumerateProvidedTargetSpecs = (specs) => {
  const desiredDigits = { Deg: 2, Cm: 2, Px: 0, Sec: 2, DBSPL: 1 };
  const toRound = (propName) =>
    propName.match(/.*(Cm$)|(Deg$)|(Px$)|(Sec$)|(DBSPL$)/);
  const getSpecString = (propName) => {
    const isRounded = toRound(propName);
    const digitsToKeep = isRounded ? desiredDigits[isRounded[0]] : 0;
    const valueString = new String(
      toRound(propName)
        ? toFixedNumber(specs[propName], digitsToKeep)
        : specs[propName],
    );
    const specString = propName + ": " + valueString;
    return specString;
  };
  const enumeratedProps = Object.getOwnPropertyNames(specs)
    .sort()
    .map(getSpecString)
    .join("\n");
  return enumeratedProps;
};
