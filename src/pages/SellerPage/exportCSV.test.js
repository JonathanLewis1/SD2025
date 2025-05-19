import { exportToCSV } from './exportCSV';

describe('exportToCSV util', () => {
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    // spy on createObjectURL
    URL.createObjectURL = jest.fn(() => 'blob:url');
    URL.revokeObjectURL = jest.fn();
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        return { href: '', download: '', click: jest.fn() };
      }
      return document.createElement(tag);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Given empty data, When called, Then alerts and does nothing else', () => {
    exportToCSV([], 'file');
    expect(window.alert).toHaveBeenCalledWith('No data to export.');
  });

  test('Given valid data, When called, Then generates and clicks download link', () => {
    const data = [{ a: 1, b: 'x' }, { a: 2, b: 'y' }];
    exportToCSV(data, 'myfile');
    // headers row + two data rows
    expect(URL.createObjectURL).toHaveBeenCalled();
    const aTag = document.createElement.mock.results.find(r => r.value.download).value;
    expect(aTag.download).toBe('myfile.csv');
    expect(aTag.click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
