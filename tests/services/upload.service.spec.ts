import { FILE_TYPE_SUPPORT_ERROR, SUPPORTED_FILE_TYPES, UploadService } from '../../src/app/core/services/upload.service';

const PERIOD = '.';

describe('UploadService', () => {
  describe('.isSupportedFileType(fileName)', () => {
    it('can distinguish valid / invalid filetypes', () => {
      const uploadService = new UploadService(null);
      for (const validFileType of SUPPORTED_FILE_TYPES) {
        const validFileName = 'testFile' + PERIOD + validFileType;
        expect(uploadService.isSupportedFileType(validFileName)).toBe(true);
      }
      const invalidFileName = 'testFile' + PERIOD + 'java';
      expect(uploadService.isSupportedFileType(invalidFileName)).toBe(false);
    });

    it('is case insensitive', () => {
      const uploadService = new UploadService(null);
      const invalidFileName = 'TESTfile' + PERIOD + 'JS';
      expect(uploadService.isSupportedFileType(invalidFileName)).toBe(false);
    });

    it('returns false for filenames that do not have a file extension', () => {
      const uploadService = new UploadService(null);
      for (const validFileType of SUPPORTED_FILE_TYPES) {
        const fileNameWithoutFileExtension = 'testFile' + validFileType;
        expect(uploadService.isSupportedFileType(fileNameWithoutFileExtension)).toBe(false);
      }
    });
  });

  describe('.uploadFile(fileData, fileName)', () => {
    it('throws an error if an invalid filetype is uploaded', (done) => {
      const uploadService = new UploadService(null);
      uploadService.uploadFile('testdata', 'testFile.java').subscribe(
        (val) => {
          fail('This test case should fail.');
          done();
        },
        (error) => {
          expect(error).toBe(FILE_TYPE_SUPPORT_ERROR);
          done();
        }
      );
    });
  });
});
