// // src/utils/exportCSV.test.js
// import { exportToCSV } from './exportToCSV';

// describe('exportToCSV', () => {
//   let createElementSpy, clickSpy, revokeSpy;

//   beforeEach(() => {
//     createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(() => ({
//       set href(value) {},
//       set download(value) {},
//       click: jest.fn(),
//     }));

//     clickSpy = jest.fn();
//     global.URL.createObjectURL = jest.fn(() => 'blob:url');
//     revokeSpy = jest.spyOn(global.URL, 'revokeObjectURL').mockImplementation(() => {});
//     jest.spyOn(window, 'alert').mockImplementation(() => {});
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//   });

//   test('Given valid data, When exportToCSV is called, Then it should download a CSV file', () => {
//     const data = [
//       { name: 'Alice', age: 30 },
//       { name: 'Bob', age: 25 }
//     ];
//     const a = {
//       click: clickSpy,
//       set href(_) {},
//       set download(_) {}
//     };

//     createElementSpy.mockReturnValue(a);

//     exportToCSV(data, 'testfile');
//     expect(global.URL.createObjectURL).toHaveBeenCalled();
//     expect(clickSpy).toHaveBeenCalled();
//     expect(revokeSpy).toHaveBeenCalledWith('blob:url');
//   });

//   test('Given empty data, When exportToCSV is called, Then it should alert the user', () => {
//     exportToCSV([], 'emptyfile');
//     expect(window.alert).toHaveBeenCalledWith('No data to export.');
//   });
// });
test.todo('Test need to be done');