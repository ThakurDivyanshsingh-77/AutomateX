import { normalizeFileId } from './utils/fileUtils.js';

console.log('Testing normalizeFileId function:');
console.log('1. "file_ABC123" =>', normalizeFileId("file_ABC123"));
console.log('2. { id: "file_ABC123" } =>', normalizeFileId({ id: "file_ABC123" }));
console.log('3. "file_ABC123file_ABC123" =>', normalizeFileId("file_ABC123file_ABC123"));
console.log('4. "file_e0b6972d9cd05b780da1eab0file_e0b6972d9cd05b780da1eab0" =>', normalizeFileId("file_e0b6972d9cd05b780da1eab0file_e0b6972d9cd05b780da1eab0"));
console.log('5. { file: { id: "file_ABC123" } } =>', normalizeFileId({ file: { id: "file_ABC123" } }));

if (
  normalizeFileId("file_ABC123") === "file_ABC123" &&
  normalizeFileId({ id: "file_ABC123" }) === "file_ABC123" &&
  normalizeFileId("file_ABC123file_ABC123") === "file_ABC123" &&
  normalizeFileId("file_e0b6972d9cd05b780da1eab0file_e0b6972d9cd05b780da1eab0") === "file_e0b6972d9cd05b780da1eab0"
) {
  console.log('✅ ALL NORMALIZE UNIT TESTS PASSED!');
  process.exit(0);
} else {
  console.error('❌ NORMALIZE UNIT TESTS FAILED!');
  process.exit(1);
}
