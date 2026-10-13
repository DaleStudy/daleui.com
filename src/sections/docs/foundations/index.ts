import { CodeTab, CodeTabs } from "../CodeTabs";
import { demoScope } from "../demoScope";
import { LiveDemo, LiveDemoSlot } from "../LiveDemo";
import {
  BorderStyleSample,
  BorderTable,
  BorderWidthTable,
} from "./BorderBlocks";
import { PaletteGrid, SemanticColorTable } from "./ColorBlocks";
import { IconGallery } from "./IconBlocks";
import { RadiusTable } from "./RadiusBlocks";
import { SpacingTable } from "./SpacingBlocks";
import {
  FontSizeTable,
  FontTable,
  FontWeightTable,
  LetterSpacingTable,
  LineHeightTable,
  TextStyleSamples,
} from "./TypographyBlocks";

/** MDX 문서에서 import 없이 바로 쓸 수 있는 블록입니다. */
export const docsComponents = {
  ...demoScope,
  BorderStyleSample,
  BorderTable,
  BorderWidthTable,
  CodeTab,
  CodeTabs,
  FontSizeTable,
  FontTable,
  FontWeightTable,
  IconGallery,
  LetterSpacingTable,
  LineHeightTable,
  LiveDemo,
  LiveDemoSlot,
  PaletteGrid,
  RadiusTable,
  SemanticColorTable,
  SpacingTable,
  TextStyleSamples,
};
