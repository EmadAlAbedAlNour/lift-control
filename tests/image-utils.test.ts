import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_IMAGE_URLS, IMAGE_PLACEHOLDER_VALUE } from "../lib/constants/images";
import {
  ensureImageUrl,
  ensureImageUrlList,
  getSettingImageFallback,
  isPlaceholderImageValue,
  toRenderableImageUrl
} from "../lib/utils/image";

test("ensureImageUrl falls back when value is empty or invalid", () => {
  const fallback = DEFAULT_IMAGE_URLS.project;

  assert.equal(ensureImageUrl("", fallback), fallback);
  assert.equal(ensureImageUrl("not-a-url", fallback), fallback);
  assert.equal(ensureImageUrl(" /uploads/image.png ", fallback), "/uploads/image.png");
});

test("ensureImageUrlList always returns at least one valid image", () => {
  const fallback = DEFAULT_IMAGE_URLS.banner;

  assert.deepEqual(ensureImageUrlList([], fallback), [fallback]);
  assert.deepEqual(ensureImageUrlList(["invalid", "https://example.com/a.jpg"], fallback), [
    "https://example.com/a.jpg"
  ]);
});

test("getSettingImageFallback returns mapped or global fallback", () => {
  assert.equal(getSettingImageFallback("profile.companyLogoUrl"), DEFAULT_IMAGE_URLS.companyLogo);
  assert.equal(getSettingImageFallback("unknown.key"), DEFAULT_IMAGE_URLS.global);
});

test("placeholder token is not renderable", () => {
  assert.equal(isPlaceholderImageValue(IMAGE_PLACEHOLDER_VALUE), true);
  assert.equal(toRenderableImageUrl(IMAGE_PLACEHOLDER_VALUE), undefined);
  assert.equal(toRenderableImageUrl("https://example.com/a.jpg"), "https://example.com/a.jpg");
});
