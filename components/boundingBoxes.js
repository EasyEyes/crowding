import * as visual from "../psychojs/src/visual/index.js";
import * as util from "../psychojs/src/util/index.js";
import { PsychoJS } from "../psychojs/src/core/index.js";
import { logger, Rectangle } from "./utils.js";

/**
 * Generate all the stim objects for the various bounding boxes, ie
 * - the box stims which are sized based on the individual elements of the stimuli, and placed over the stimuli
 * - the box stims which are sized based on the character set union bounding box, and placed over the stimuli
 * - the character and box stims which are sized based on the character set union bounding box, and place over the display character set
 * @param {*} reader
 * @param {*} psychoJS
 * @returns {any[]} [boundingBoxPolies, characterSetBoundingBoxPolies, displayCharacterSetBoundingBoxStims]
 */
export const generateBoundingBoxPolies = (reader, psychoJS) => {
  const boundingConfig = {
    win: psychoJS.window,
    units: "pix",
    width: [1.0, 1.0][0],
    height: [1.0, 1.0][1],
    ori: 0.0,
    pos: [0, 0],
    lineWidth: 1.0,
    // fillColor: "#000000",
    opacity: undefined,
    depth: -10,
    interpolate: true,
    size: 0,
  };
  const targetBoundingPoly = new visual.Rect({
    ...boundingConfig,
    lineColor: new util.Color("blue"),
    name: "targetBoundingPoly",
  });
  const flanker1BoundingPoly = new visual.Rect({
    ...boundingConfig,
    lineColor: new util.Color("blue"),
    name: "flanker1BoundingPoly",
  });
  const flanker2BoundingPoly = new visual.Rect({
    ...boundingConfig,
    lineColor: new util.Color("blue"),
    name: "flanker2BoundingPoly",
  });
  const targetCharacterSetBoundingPoly = new visual.Rect({
    ...boundingConfig,
    lineColor: new util.Color("green"),
    name: "targetCharacterSetBoundingPoly",
  });
  const flanker1CharacterSetBoundingPoly = new visual.Rect({
    ...boundingConfig,
    lineColor: new util.Color("green"),
    name: "flanker1CharacterSetBoundingPoly",
  });
  const flanker2CharacterSetBoundingPoly = new visual.Rect({
    ...boundingConfig,
    lineColor: new util.Color("green"),
    name: "flanker2CharacterSetBoundingPoly",
  });
  const boundingBoxPolies = {
    target: targetBoundingPoly,
    flanker1: flanker1BoundingPoly,
    flanker2: flanker2BoundingPoly,
  };
  const characterSetBoundingBoxPolies = {
    target: targetCharacterSetBoundingPoly,
    flanker1: flanker1CharacterSetBoundingPoly,
    flanker2: flanker2CharacterSetBoundingPoly,
  };
  const displayCharacterSetBoundingBoxPolies = {};
  for (const cond of reader.read("block_condition", "__ALL_BLOCKS__")) {
    const characterSet = String(reader.read("targetCharacterSet", cond)).split(
      ""
    );
    if (reader.read("showCharacterSetBoundingBoxBool", cond)) {
      displayCharacterSetBoundingBoxPolies[cond] =
        getDisplayCharacterSetBoundingPolies(
          characterSet,
          boundingConfig,
          psychoJS
        );
    }
  }
  return [
    boundingBoxPolies,
    characterSetBoundingBoxPolies,
    displayCharacterSetBoundingBoxPolies,
  ];
};

const getDisplayCharacterSetBoundingPolies = (
  characterSet,
  boundingConfig,
  psychoJS
) => {
  const [polies, characters] = [[], []];
  for (const character of characterSet) {
    characters.push(
      new visual.TextStim({
        win: psychoJS.window,
        name: `displayCharacterSet_${character}`,
        text: character,
        font: "Arial",
        units: "pix",
        pos: [0, 0],
        height: 1.0,
        wrapWidth: undefined,
        ori: 0.0,
        color: new util.Color("black"),
        opacity: 1.0,
        depth: -10,
      })
    );
    polies.push(
      new visual.Rect({
        ...boundingConfig,
        lineColor: new util.Color("red"),
        name: `displayCharacterSetBoundingBox-${character}`,
      })
    );
  }
  return { characters: characters, polies: polies };
};

/**
 * Add the bounding box stimulus objects to the trial's components list, ie so they cleaned up with the rest of trial stimuli after the trial
 * @param {boolean} showBoundingBox Whether or not to show the bounding box(s) of the stimuli around the stimuli
 * @param {boolean} showCharacterSetBoundingBox  Whether or not to show the bounding box(s) of the character set around the stimuli
 * @param {PsychoJS.visual.Rect[]} stimulusPolies Array of bounding box rects, placed over the stimulus, sized based on the individual stimulus objects.
 * @param {PsychoJS.visual.Rect[]} characterSetStims Array of bounding box rects, placed over the stimulus, sized based on the union bounding box of the character set.
 * @param {object} displayCharacterSetStims Collection of stims for showing the union bounding box of the charcter set, displayed over the full character set.
 * @param {PsychoJS.visual.TextStim[]} displayCharacterSetStims.characters The character stims for the display charcter set.
 * @param {PsychoJS.visual.Rect[]} displayCharacterSetStims.polies The bounding box rect stims for the display charcter set.
 * @param {string} spacingRelationToSize Experiment parameter of the same name.
 * @param {string} thresholdParameter Experiment parameter of the same name.
 * @param {any[]} trialComponents Array of psychoJS stim objects used in this trial routine
 */
export const addBoundingBoxesToComponents = (
  showBoundingBox,
  showCharacterSetBoundingBox,
  stimulusPolies,
  characterSetPolies,
  displayCharacterSetStims,
  spacingRelationToSize,
  thresholdParameter,
  trialComponents
) => {
  if (showBoundingBox) {
    trialComponents.push(stimulusPolies.target);
    if (
      (spacingRelationToSize === "ratio" || spacingRelationToSize === "none") &&
      thresholdParameter === "spacing"
    ) {
      trialComponents.push(stimulusPolies.flanker1);
      trialComponents.push(stimulusPolies.flanker2);
    }
  }
  if (showCharacterSetBoundingBox) {
    trialComponents.push(characterSetPolies.target);
    if (
      (spacingRelationToSize === "ratio" || spacingRelationToSize === "none") &&
      thresholdParameter === "spacing"
    ) {
      trialComponents.push(characterSetPolies.flanker1);
      trialComponents.push(characterSetPolies.flanker2);
    }
    trialComponents.push(
      ...displayCharacterSetStims.characters,
      ...displayCharacterSetStims.polies
    );
  }
};

/**
 * Check whether each bounding box related stim should be drawn or started at the current time.
 * @param {number} t Current time
 * @param {number} frameRemains (?) Time at which the stimulus should be undrawn
 * @param {number} frameN Int, frame number
 * @param {boolean} showBoundingBox Whether or not to show the bounding boxes based on individual character size.
 * @param {boolean} showCharacterSetBoundingBox Whether or not to show the bounding boxes based on the union character set bounding box size.
 * @param {PsychoJS.visual.Rect{}} boundingBoxPolies Collection (ie {target:Rect, flanker1:Rect, flanker2:Rect}) of the bounding box rects of the stimuli (ie triplet).
 * @param {PsychoJS.visual.Rect{}} characterSetBoundingBoxPolies Array (ie {target:Rect, flanker1:Rect, flanker2:Rect}) of the union character set bounding box rects displayed over the stimuli (ie triplet).
 * @param {object} displayCharacterSetStims Collection of stims for displaying the union character set bounding boxes over a full, display character set.
 * @param {PsychoJS.visual.TextStim[]} displayCharacterSetStims.characters Array of text stims of the full, display character set.
 * @param {PsychoJS.visual.Rect[]} displayCharacterSetStims.polies Array of rect stims of the bounding boxes for the full, display character set.
 * @param {string} spacingRelationToSize Experiment parameter of the same name.
 * @param {number} timeWhenRespondable Time after which responses are accepted.
 */
export const updateBoundingBoxPolies = (
  t,
  frameRemains,
  frameN,
  showBoundingBox,
  showCharacterSetBoundingBox,
  boundingBoxPolies,
  characterSetBoundingBoxPolies,
  displayCharacterSetStims,
  spacingRelationToSize,
  timeWhenRespondable
) => {
  updateTripletBoundingBoxPolies(
    t,
    frameRemains,
    frameN,
    showBoundingBox,
    showCharacterSetBoundingBox,
    boundingBoxPolies,
    characterSetBoundingBoxPolies,
    spacingRelationToSize
  );
  if (showCharacterSetBoundingBox)
    updateDisplayCharacterSetBoundingBoxStims(
      displayCharacterSetStims,
      timeWhenRespondable,
      t,
      frameN
    );
};

const updateTripletBoundingBoxPolies = (
  t,
  frameRemains,
  frameN,
  showBoundingBox,
  showCharacterSetBoundingBox,
  boundingBoxPolies,
  characterSetBoundingBoxPolies,
  spacingRelationToSize
) => {
  if (showBoundingBox) {
    // // *targetBoundingPoly* updates
    if (
      t >= 0.0 &&
      boundingBoxPolies.target.status === PsychoJS.Status.NOT_STARTED
    ) {
      // keep track of start time/frame for later
      boundingBoxPolies.target.tStart = t; // (not accounting for frame time here)
      boundingBoxPolies.target.frameNStart = frameN; // exact frame index
      boundingBoxPolies.target.setAutoDraw(true);
    }
    if (
      boundingBoxPolies.target.status === PsychoJS.Status.STARTED &&
      t >= frameRemains
    ) {
      boundingBoxPolies.target.setAutoDraw(false);
    }

    // // *flanker1BoundingPoly* updates
    if (
      t >= 0.0 &&
      boundingBoxPolies.flanker1.status === PsychoJS.Status.NOT_STARTED &&
      spacingRelationToSize === "ratio"
    ) {
      // keep track of start time/frame for later
      boundingBoxPolies.flanker1.tStart = t; // (not accounting for frame time here)
      boundingBoxPolies.flanker1.frameNStart = frameN; // exact frame index
      boundingBoxPolies.flanker1.setAutoDraw(true);
    }
    if (
      boundingBoxPolies.flanker1.status === PsychoJS.Status.STARTED &&
      t >= frameRemains
    ) {
      boundingBoxPolies.flanker1.setAutoDraw(false);
    }

    // // *flanker2BoundingPoly* updates
    if (
      t >= 0.0 &&
      boundingBoxPolies.flanker2.status === PsychoJS.Status.NOT_STARTED &&
      spacingRelationToSize === "ratio"
    ) {
      // keep track of start time/frame for later
      boundingBoxPolies.flanker2.tStart = t; // (not accounting for frame time here)
      boundingBoxPolies.flanker2.frameNStart = frameN; // exact frame index

      boundingBoxPolies.flanker2.setAutoDraw(true);
    }
    if (
      boundingBoxPolies.flanker2.status === PsychoJS.Status.STARTED &&
      t >= frameRemains
    ) {
      boundingBoxPolies.flanker2.setAutoDraw(false);
    }
  }
  if (showCharacterSetBoundingBox) {
    // // *targetBoundingPoly* updates
    if (
      t >= 0.0 &&
      characterSetBoundingBoxPolies.target.status ===
        PsychoJS.Status.NOT_STARTED
    ) {
      // keep track of start time/frame for later
      characterSetBoundingBoxPolies.target.tStart = t; // (not accounting for frame time here)
      characterSetBoundingBoxPolies.target.frameNStart = frameN; // exact frame index
      characterSetBoundingBoxPolies.target.setAutoDraw(true);
    }
    if (
      characterSetBoundingBoxPolies.target.status === PsychoJS.Status.STARTED &&
      t >= frameRemains
    ) {
      characterSetBoundingBoxPolies.target.setAutoDraw(false);
    }

    // // *flanker1BoundingPoly* updates
    if (
      t >= 0.0 &&
      characterSetBoundingBoxPolies.flanker1.status ===
        PsychoJS.Status.NOT_STARTED &&
      spacingRelationToSize === "ratio"
    ) {
      // keep track of start time/frame for later
      characterSetBoundingBoxPolies.flanker1.tStart = t; // (not accounting for frame time here)
      characterSetBoundingBoxPolies.flanker1.frameNStart = frameN; // exact frame index

      characterSetBoundingBoxPolies.flanker1.setAutoDraw(true);
    }
    if (
      characterSetBoundingBoxPolies.flanker1.status ===
        PsychoJS.Status.STARTED &&
      t >= frameRemains
    ) {
      characterSetBoundingBoxPolies.flanker1.setAutoDraw(false);
    }

    // // *flanker2BoundingPoly* updates
    if (
      t >= 0.0 &&
      characterSetBoundingBoxPolies.flanker2.status ===
        PsychoJS.Status.NOT_STARTED &&
      spacingRelationToSize === "ratio"
    ) {
      // keep track of start time/frame for later
      characterSetBoundingBoxPolies.flanker2.tStart = t; // (not accounting for frame time here)
      characterSetBoundingBoxPolies.flanker2.frameNStart = frameN; // exact frame index

      characterSetBoundingBoxPolies.flanker2.setAutoDraw(true);
    }
    if (
      characterSetBoundingBoxPolies.flanker2.status ===
        PsychoJS.Status.STARTED &&
      t >= frameRemains
    ) {
      characterSetBoundingBoxPolies.flanker2.setAutoDraw(false);
    }
  }
};
const updateDisplayCharacterSetBoundingBoxStims = (
  displayCharacterSetPolies,
  timeWhenRespondable,
  t,
  frameN
) => {
  if (t >= timeWhenRespondable) {
    const characterAndPolygonStims = [
      ...displayCharacterSetPolies.characters,
      ...displayCharacterSetPolies.polies,
    ];
    for (const characterPoly of characterAndPolygonStims) {
      if (characterPoly.status === PsychoJS.Status.NOT_STARTED) {
        // keep track of start time/frame for later
        characterPoly.tStart = t; // (not accounting for frame time here)
        characterPoly.frameNStart = frameN; // exact frame index
        characterPoly.setAutoDraw(true);
      }
    }
  }
};

/**
 * Place and scale all the psychoJS stims related to visualizing bounding boxes
 * @param {object} boundingBoxVisibility Should the bounding boxes be shown based on...
 * @param {boolean} boundingBoxVisibility.stimulus ...the size of the individual stimuli?
 * @param {boolean} boundingBoxVisibility.characterSet ...the size of the full (ie overlayed) character set?
 * @param {object} tripletBoundingStimuli The arrays of bounding box stimuli which will be positioned over the triplet, and sized...
 * @param {visual.Rect{}} tripletBoundingStimuli.stimulus ... based on the individual stimuli sizes, ie a uniquely sized bounding box for each character of the stimulus (eg triplet).
 * @param {visual.Rect{}} tripletBoundingStimuli.characterSet ...based on the bounding box of the full character set, ie all bounding boxes on the stimulus are the same size.
 * @param {object} displayCharacterSetBoundingStimuli The stims for the (response-time) display of the full character set.
 * @param {visual.Rect[]} displayCharacterSetBoundingStimuli.polies The bounding box polygons, one for each character in the character set.
 * @param {visual.TextStim[]} displayCharacterSetBoundingStimuli.characters The stims for the characters of the display character set.
 * @param {visual.TextStim[]} triplet The actual stimulus objects of the target, ie the stimuls shown to the observer.
 * @param {Rectangle} normalizedCharacterSetBoundingRect The normalized bounding box of the union of all characters in the character set.
 * @param {object} trialParameters Collection of parameters relating to the current trial
 * @param {number} trialParameters.heightPx The value used to set the height of the target stim
 * @param {string} trialParameters.spacingRelationToSize Experiment parameter of the same name
 * @param {string} trialParameters.thresholdParameter Experiment parameter of the same name
 * @param {string} trialParameters.targetFont (Correctly escaped) Experiment parameter of the same name
 * @param {[number, number]} trialParameters.windowSize Current dimensions of the window, ie `psychoJS.window._size`
 */
export const sizeAndPositionBoundingBoxes = (
  boundingBoxVisibility,
  tripletBoundingStimuli,
  displayCharacterSetBoundingStimuli,
  triplet,
  normalizedCharacterSetBoundingRect,
  trialParameters
) => {
  sizeAndPositionTripletBoundingBoxes(
    boundingBoxVisibility.stimulus,
    boundingBoxVisibility.characterSet,
    tripletBoundingStimuli.stimulus,
    tripletBoundingStimuli.characterSet,
    triplet,
    normalizedCharacterSetBoundingRect,
    trialParameters.heightPx,
    trialParameters.spacingRelationToSize,
    trialParameters.thresholdParameter
  );
  if (boundingBoxVisibility.characterSet)
    sizeAndPositionDisplayCharacterSet(
      displayCharacterSetBoundingStimuli,
      normalizedCharacterSetBoundingRect,
      trialParameters.targetFont,
      trialParameters.windowSize
    );
};

const sizeAndPositionTripletBoundingBoxes = (
  showBoundingBox,
  showCharacterSetBoundingBox,
  boundingBoxPolies,
  characterSetBoundingBoxPolies,
  triplet,
  normalizedCharacterSetBoundingRect,
  heightPx,
  spacingRelationToSize,
  thresholdParameter
) => {
  if (showBoundingBox) {
    const boundingStims = [boundingBoxPolies.target];
    const targetBoundingBox = triplet.target.getBoundingBox(true);
    boundingBoxPolies.target.setPos([
      targetBoundingBox.left,
      targetBoundingBox.top,
    ]);
    boundingBoxPolies.target.setSize([
      targetBoundingBox.width,
      targetBoundingBox.height,
    ]);
    if (
      (spacingRelationToSize === "ratio" || spacingRelationToSize === "none") &&
      thresholdParameter === "spacing"
    ) {
      boundingStims.push(
        boundingBoxPolies.flanker1,
        boundingBoxPolies.flanker2
      );
      const flanker1BoundingBox = triplet.flanker1.getBoundingBox(true);
      boundingBoxPolies.flanker1.setPos([
        flanker1BoundingBox.left,
        flanker1BoundingBox.top,
      ]);
      boundingBoxPolies.flanker1.setSize([
        flanker1BoundingBox.width,
        flanker1BoundingBox.height,
      ]);
      const flanker2BoundingBox = triplet.flanker2.getBoundingBox(true);
      boundingBoxPolies.flanker2.setPos([
        flanker2BoundingBox.left,
        flanker2BoundingBox.top,
      ]);
      boundingBoxPolies.flanker2.setSize([
        flanker2BoundingBox.width,
        flanker2BoundingBox.height,
      ]);
    }
    boundingStims.forEach((c) => c._updateIfNeeded());
  }
  if (showCharacterSetBoundingBox) {
    const characterSetBoundingStims = [characterSetBoundingBoxPolies.target];
    const characterSetBounds = [
      normalizedCharacterSetBoundingRect.width * heightPx,
      normalizedCharacterSetBoundingRect.height * heightPx,
    ];
    const targetBB = triplet.target.getBoundingBox(true);
    characterSetBoundingBoxPolies.target.setPos([targetBB.left, targetBB.top]);
    characterSetBoundingBoxPolies.target.setSize(characterSetBounds);
    if (
      (spacingRelationToSize === "ratio" || spacingRelationToSize === "none") &&
      thresholdParameter === "spacing"
    ) {
      const flanker1BB = triplet.flanker1.getBoundingBox(true);
      const flanker2BB = triplet.flanker2.getBoundingBox(true);
      characterSetBoundingStims.push(
        characterSetBoundingBoxPolies.flanker1,
        characterSetBoundingBoxPolies.flanker2
      );
      characterSetBoundingBoxPolies.flanker1.setPos([
        flanker1BB.left,
        flanker1BB.top,
      ]);
      characterSetBoundingBoxPolies.flanker1.setSize(characterSetBounds);
      characterSetBoundingBoxPolies.flanker2.setPos([
        flanker2BB.left,
        flanker2BB.top,
      ]);
      characterSetBoundingBoxPolies.flanker2.setSize(characterSetBounds);
    }
    characterSetBoundingStims.forEach((c) => c._updateIfNeeded());
  }
};

const sizeAndPositionDisplayCharacterSet = (
  displayCharacterSetStimuli,
  normalizedCharacterSetBoundingRect,
  font,
  windowDims
) => {
  const heightPx = 150;
  const characterSetBounds = [
    normalizedCharacterSetBoundingRect.width * heightPx,
    normalizedCharacterSetBoundingRect.height * heightPx,
  ];
  const paddedWidthOfCharacter = characterSetBounds[0] * 1.2;
  const indicies = [...displayCharacterSetStimuli.polies.keys()];
  const middleIndex = Math.floor(indicies.length / 2);
  const positions = indicies.map((i) => [
    (i - middleIndex) * paddedWidthOfCharacter,
    -windowDims[1] / 10,
  ]);
  for (const i of indicies) {
    const displayCharacterBox = displayCharacterSetStimuli.polies[i];
    const displayCharacter = displayCharacterSetStimuli.characters[i];
    const position = positions[i];

    displayCharacter.setFont(font);
    displayCharacter.setHeight(heightPx);
    displayCharacter.setPos(position);
    displayCharacter._updateIfNeeded();

    const displayCharacterBoundingBox = displayCharacter.getBoundingBox(true);
    displayCharacterBox.setSize(characterSetBounds);
    displayCharacterBox.setPos([
      displayCharacterBoundingBox.left,
      displayCharacterBoundingBox.top,
    ]);
  }
};