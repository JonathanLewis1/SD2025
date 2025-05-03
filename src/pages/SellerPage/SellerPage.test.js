// //Mock-React Router navigation
// const mockNavigate = jest.fn();
// jest.mock('react-router-dom', () => ({
//     ...jest.requireActual('react-router-dom'),
//     useNavigate:() =>mockNavigate,
// }));

// //Mock-Firebase authentication and database module
// jest.mock('../../firebase',()=>({
//   auth:{},
//   db:{},
// }));

// // Store references to these so we can override them per test
// const mockGetDoc=jest.fn();
// const mockAddDoc=jest.fn();
// const mockDeleteDoc=jest.fn();
// const mockSendPasswordResetEmail=jest.fn();
// const mockGetDocs=jest.fn();
// const mockOnAuthStateChanged=jest.fn();
// const mockSignInWithEmailAndPassword=jest.fn();

// jest.mock('firebase/auth',()=>{
//   const originalModule=jest.requireActual('firebase/auth');
//   return{
//     ...originalModule,
//     signInWithEmailAndPassword: (...args)=>mockSignInWithEmailAndPassword(...args),
//     sendPasswordResetEmail: (...args)=>mockSendPasswordResetEmail(...args),
//     signOut:jest.fn(),
//     onAuthStateChanged:(auth,cb)=>{
//         mockOnAuthStateChanged(auth,cb);
//         return()=>{};
//     },
//   };
// });

// jest.mock('firebase/firestore',()=>{
//   const originalModule=jest.requireActual('firebase/firestore');
//   return {
//     ...originalModule,
//     collection:jest.fn(),
//     query:jest.fn(),
//     where:jest.fn(),
//     doc: jest.fn(()=>({})),
//     getDoc:(...args)=>mockGetDoc(...args),
//     getDocs:(...args)=>mockGetDocs(...args),
//     addDoc:(...args)=>mockAddDoc(...args),
//     deleteDoc:(...args)=>mockDeleteDoc(...args),
//   };
// });

// import {render,screen,fireEvent,waitFor }from '@testing-library/react';
// import SellerPage from './SellerPage.js';
// import {BrowserRouter} from 'react-router-dom';

// const renderWithRouter = (ui)=>render(<BrowserRouter>{ui}</BrowserRouter>);

// // Helper: ensure getDocs always returns docs array for error tests
// beforeEach(()=>{
//     mockGetDocs.mockResolvedValue({docs:[]});
//     mockOnAuthStateChanged.mockImplementation((auth,cb)=>cb({email:'test@email.com'}));
//   });

// //Empty name
// test('Given a seller is on seller page, when they add a product with an empty name, then an error message should display',async()=>{
//   renderWithRouter(<SellerPage />);
//   fireEvent.change(screen.getByPlaceholderText(/price/i),{target:{value:'100'}});
//   fireEvent.change(screen.getByPlaceholderText(/description/i),{target:{value:'description'}});
//   fireEvent.change(screen.getByPlaceholderText(/image url/i),{target:{value:'imageURL'}});
//   fireEvent.click(screen.getByRole('button',{name:/add product/i }));
//   expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
// });

// //Empty price
// test('Given a seller is on seller page, when they add a product with an empty price, then an error message should display',async()=>{
//   renderWithRouter(<SellerPage />);
//   fireEvent.change(screen.getByPlaceholderText(/name/i), {target:{value:'name'} });
//   fireEvent.change(screen.getByPlaceholderText(/description/i), {target:{value:'description'} });
//   fireEvent.change(screen.getByPlaceholderText(/image url/i), {target:{value:'imageURL'} });
//   fireEvent.click(screen.getByRole('button',{name:/add product/i }));
//   expect(await screen.findByText(/price is required/i)).toBeInTheDocument();
// });

// //Empty description
// test('Given a seller is on seller page, when they add a product with an empty description, then an error message should display',async()=>{
//   renderWithRouter(<SellerPage />);
//   fireEvent.change(screen.getByPlaceholderText(/name/i),{target:{value:'name'}});
//   fireEvent.change(screen.getByPlaceholderText(/price/i),{target:{value:'100'}});
//   fireEvent.change(screen.getByPlaceholderText(/image url/i),{target:{value:'imageURL'}});
//   fireEvent.click(screen.getByRole('button',{name:/add product/i}));
//   expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
// });

// //Empty image URL
// test('Given a seller is on seller page, when they add a product with an empty image url, then an error message should display',async()=>{
//   renderWithRouter(<SellerPage />);
//   fireEvent.change(screen.getByPlaceholderText(/name/i),{target:{value:'name'}});
//   fireEvent.change(screen.getByPlaceholderText(/price/i),{target:{value:'100'}});
//   fireEvent.change(screen.getByPlaceholderText(/description/i),{target:{value:'description'}});
//   fireEvent.click(screen.getByRole('button',{name:/add product/i}));
//   expect(await screen.findByText(/image url is required/i)).toBeInTheDocument();
// });

// //Sellers products displayed
// test('Given a logged in seller, when the seller views their screen, then the seller\'s products will display',async()=>{
//     mockOnAuthStateChanged.mockImplementation((auth,cb)=>cb({email:'test@email.com'}));
//     mockGetDocs.mockResolvedValue({docs:[{id:'1',data:()=>({name:'Item A',price:99,description:'Nice',image:'img.jpg',email:'test@email.com'})}]});
//     renderWithRouter(<SellerPage/>);
//     expect(await screen.findByText(/Item A/i)).toBeInTheDocument();
//     expect(screen.getByText(/R99/i)).toBeInTheDocument();
//     expect(screen.getByText(/Nice/i)).toBeInTheDocument();
//   });
  
// // ✅ Form submission with valid input
// test('Given a logged in seller, when they add a valid product, then product is added and the form clears',async()=>{
//     mockOnAuthStateChanged.mockImplementation((auth,cb)=>cb({email:'seller@email.com'}));
//     mockAddDoc.mockResolvedValue();
//     mockGetDocs.mockResolvedValue({docs:[]});
//     renderWithRouter(<SellerPage/>);
//     fireEvent.change(screen.getByPlaceholderText(/name/i),{target:{value:'Product X'}});
//     fireEvent.change(screen.getByPlaceholderText(/price/i),{target:{value:'150'}});
//     fireEvent.change(screen.getByPlaceholderText(/description/i),{target:{value:'Desc here'}});
//     fireEvent.change(screen.getByPlaceholderText(/image url/i),{target:{value:'url.jpg'}});
//     fireEvent.click(screen.getByRole('button',{name:/add product/i}));
//     await waitFor(()=>{
//         expect(mockAddDoc).toHaveBeenCalled();
//     });
// });

// // No email attempt in product add
// test('Given no user email, when add product is clicked, then an error message is displayed',async()=>{
//     mockOnAuthStateChanged.mockImplementation((auth,cb)=>cb(null));
//     mockGetDocs.mockResolvedValue({docs:[]});
//     renderWithRouter(<SellerPage/>);
//     fireEvent.click(screen.getByRole('button',{name:/add product/i}));
//     expect(await screen.findByText(/you must be logged in to add a product/i)).toBeInTheDocument();
// });

// // Delete product
// test('Given a logged in seller, when a products delete button is clicked, then product is deleted',async()=>{
//     mockOnAuthStateChanged.mockImplementation((auth,cb)=>cb({email:'seller@email.com'}));
//     mockGetDocs.mockResolvedValue({docs:[{id:'1',data:()=>({name:'Item Z',price:55,description:'Cool',image:'z.jpg',email:'seller@email.com'})}]});
//     mockDeleteDoc.mockResolvedValue();
//     renderWithRouter(<SellerPage/>);
//     const deleteBtn=await screen.findByRole('button',{name:/delete/i});
//     fireEvent.click(deleteBtn);
//     await waitFor(()=>{
//         expect(mockDeleteDoc).toHaveBeenCalled();
//     });
// });

// //Add product Firebase fails
// test('Given a logged in seller, when the seller clicks add product and Firebase fails, then an error alert is displayed',async()=>{
//     mockOnAuthStateChanged.mockImplementation((auth,cb)=>cb({email:'seller@email.com'}));
//     mockAddDoc.mockRejectedValue(new Error('Firestore failure'));
//     jest.spyOn(console,'error').mockImplementation(()=>{});
//     window.alert=jest.fn();
//     renderWithRouter(<SellerPage/>);
//     fireEvent.change(screen.getByPlaceholderText(/name/i),{target:{value:'Broken Product'}});
//     fireEvent.change(screen.getByPlaceholderText(/price/i),{target:{value:'500'}});
//     fireEvent.change(screen.getByPlaceholderText(/description/i),{target:{value:'Desc fail'}});
//     fireEvent.change(screen.getByPlaceholderText(/image url/i),{target:{value:'fail.jpg'}});
//     fireEvent.click(screen.getByRole('button',{name:/add product/i}));
//     await waitFor(()=>{
//         expect(window.alert).toHaveBeenCalledWith('Failed to add product: Firestore failure');
//     });
// });

// //Delete product Firebase fails
// test('Given a logged in seller, when the seller clicks delete button of a product and Firebase fails, then an error alert is displayed',async()=>{
//     mockOnAuthStateChanged.mockImplementation((auth,cb)=>cb({email:'seller@email.com'}));
//     mockGetDocs.mockResolvedValue({docs:[{id:'1',data:()=>({name:'ErrorItem',price:123,description:'desc',image:'img.jpg',email:'seller@email.com'})}]});
//     mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));
//     const consoleSpy=jest.spyOn(console,'error').mockImplementation(()=>{});
//     renderWithRouter(<SellerPage/>);
//     const deleteBtn=await screen.findByRole('button',{name:/delete/i});
//     fireEvent.click(deleteBtn);
//     await waitFor(()=>{
//         expect(consoleSpy).toHaveBeenCalledWith('Error deleting product:',expect.any(Error));
//     });
// });

// //After deletion success products are reloaded
// test('Given a logged in seller,, when a product is deleted , then current products are displayed',async()=>{
//     mockOnAuthStateChanged.mockImplementation((auth,cb)=>cb({email:'seller@email.com'}));
//     mockGetDocs.mockResolvedValue({docs:[{id:'1',data:()=>({name:'Test Item',price:55,description:'Some desc',image:'img.jpg',email:'seller@email.com'})}]});
//     mockDeleteDoc.mockResolvedValue();
//     renderWithRouter(<SellerPage/>);
//     const deleteBtn=await screen.findByRole('button',{name:/delete/i});
//     fireEvent.click(deleteBtn);
//     await waitFor(()=>{
//         expect(mockGetDocs).toHaveBeenCalled();
//     });
// });
test.todo('should render correct component based on route');