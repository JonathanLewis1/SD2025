// //Mock-React Router navigation
// const mockNavigate=jest.fn();
// jest.mock('react-router-dom',()=>({
//     ...jest.requireActual('react-router-dom'),
//     useNavigate:()=>mockNavigate,
// }));

// //Mock-Firebase authentication and database module
// jest.mock('../../firebase',()=>({
//     auth:{},
//     db:{},
// }));

// // Store references to these so we can override them per test
// const mockSignInWithEmailAndPassword=jest.fn();
// const mockGetDoc=jest.fn();
// const mockSendPasswordResetEmail=jest.fn();

// jest.mock('firebase/auth',()=>({
//     signInWithEmailAndPassword: (...args)=>mockSignInWithEmailAndPassword(...args),
//     sendPasswordResetEmail: (...args)=>mockSendPasswordResetEmail(...args),
//     signOut: jest.fn(),
// }));

// jest.mock('firebase/firestore',()=>({
//     doc:jest.fn(()=>({})),
//     getDoc:(...args)=>mockGetDoc(...args),
// }));


// import {render,screen,fireEvent,waitFor} from '@testing-library/react';
// import Login from './Login';
// import {BrowserRouter} from 'react-router-dom';

// const renderWithRouter = (ui)=> render(<BrowserRouter>{ui}</BrowserRouter>);

// //Buyer screen
// test('Given a buyer is on login page, when they enter their details, then the buyer page should load',async ()=>{
//     mockSignInWithEmailAndPassword.mockResolvedValue({user: { uid:'buyer123',emailVerified:true},});
//     mockGetDoc.mockResolvedValue({exists:()=>true,data:()=>({ role:'buyer'}),});

//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i), {target:{value:'correct@buyer.com'},});
//     fireEvent.change(screen.getByPlaceholderText(/password/i), {target:{value:'12345'},});
//     fireEvent.click(screen.getByRole('button', {name:/log in/i}));
//     await waitFor(() => {
//       expect(mockNavigate).toHaveBeenCalledWith('/home');
//     });
// });

// //Seller Screen
// test('Given a seller is on login page, when they enter their details, then the seller page should load',async ()=>{
//     mockSignInWithEmailAndPassword.mockResolvedValue({user: {uid: 'seller123',emailVerified:true},});
//     mockGetDoc.mockResolvedValue({exists:()=>true,data:()=>({role: 'seller'}),});

//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i), {target: {value:'correct@seller.com'},});
//     fireEvent.change(screen.getByPlaceholderText(/password/i), {target: {value:'12345'},});
//     fireEvent.click(screen.getByRole('button', { name: /log in/i }));
//     await waitFor(() => {
//       expect(mockNavigate).toHaveBeenCalledWith('/sellerpage');
//     });
// });

// //Admin Screen
// test('Given a admin is on login page, when they enter their details, then the admin page should load',async ()=>{
//     mockSignInWithEmailAndPassword.mockResolvedValue({user: {uid: 'admin123',emailVerified:true},});
//     mockGetDoc.mockResolvedValue({exists:()=>true,data:()=>({role: 'admin'}),});

//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i), {target: {value:'correct@admin.com'},});
//     fireEvent.change(screen.getByPlaceholderText(/password/i), {target: {value:'12345'},});
//     fireEvent.click(screen.getByRole('button', { name: /log in/i }));
//     await waitFor(() => {
//       expect(mockNavigate).toHaveBeenCalledWith('/admin');
//     });
// });

// //Invalid details
// test('Given a user is on login page, when they enter invalid details, then an error message should display',async ()=>{
//     mockSignInWithEmailAndPassword.mockRejectedValue(new Error('Auth failed'));
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'wrong@email.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'wrongpassword'}});
//     fireEvent.click(screen.getByRole('button',{name:/log in/i}));
//     expect(await screen.findByText(/Invalid email or password/i)).toBeInTheDocument();  
// });

// //Empty email
// test('Given a user is on login page, when they enter with empty email, then an error message sould display',async ()=>{
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target: {value:'invalid'}});
//     fireEvent.click(screen.getByRole('button',{name:/log in/i}));
//     expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
// });

// //Empty password
// test('Given a user is on login page, when they enter with empty password, then an error message sould display',async ()=>{
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target: {value:'wrong@email.com'}});
//     fireEvent.click(screen.getByRole('button',{name:/log in/i}));
//     expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
// });

// // Hidden password
// test('Given a user is on login page, when they enter their password, then the password should be hidden',()=>{
//     renderWithRouter(<Login />);
//     const passwordInp=screen.getByPlaceholderText(/password/i);
//     expect(passwordInp).toHaveAttribute('type','password');
// });

// //Unverified Email
// test('Given a user is on login page, when their email is not verified, then an error should display',async ()=> {
//     mockSignInWithEmailAndPassword.mockResolvedValue({user:{uid:'noverify123',emailVerified:false}});
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target:{value:'noverify@email.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target:{value:'12345'}});
//     fireEvent.click(screen.getByRole('button',{name:/log in/i}));
//     expect(await screen.findByText(/please verify your email/i)).toBeInTheDocument();
//     expect(mockNavigate).not.toHaveBeenCalled();
//   });

// //User document does not exist
// test('Given a user is on login page, when their user document does not exist, then an error message should display',async ()=>{
//     mockSignInWithEmailAndPassword.mockResolvedValue({user:{uid:'nouserdoc123',emailVerified:true}});
//     mockGetDoc.mockResolvedValue({exists:()=>false});
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target:{value:'nouserdoc@email.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target:{value:'12345'}});
//     fireEvent.click(screen.getByRole('button',{name:/log in/i}));
//     expect(await screen.findByText(/user data not found/i)).toBeInTheDocument();
//     expect(mockNavigate).not.toHaveBeenCalled();
//   });

// //Unrecognized role
// test('Given a user is on login page, when their role is not recognized, then an error message should display',async ()=>{
//     mockSignInWithEmailAndPassword.mockResolvedValue({user:{uid:'oddrole123',emailVerified:true}});
//     mockGetDoc.mockResolvedValue({exists:()=>true,data:()=>({role:'ghost'})});
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target:{value:'oddrole@email.com'}});
//     fireEvent.change(screen.getByPlaceholderText(/password/i),{target:{value:'12345'}});
//     fireEvent.click(screen.getByRole('button',{name:/log in/i}));
//     expect(await screen.findByText(/user role not recognized/i)).toBeInTheDocument();
//     expect(mockNavigate).not.toHaveBeenCalled();
// });

// //Forgot password with no email
// test('Given a user is on login page, when they click forgot password without entering an email, then an error message should display',async ()=>{
//     renderWithRouter(<Login />);
//     fireEvent.click(screen.getByText(/forgot your password/i));
//     expect(await screen.findByText(/please enter your email first/i)).toBeInTheDocument();
// });

// //Forgot password with correct email
// test('Given a user is on login page, when they click forgot password with a valid email, then a success message should display',async ()=>{
//     mockSendPasswordResetEmail.mockResolvedValue();//simulate success
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target:{value:'reset@email.com'}});
//     fireEvent.click(screen.getByText(/forgot your password/i));
//     expect(await screen.findByText(/password reset email sent/i)).toBeInTheDocument();
// });

// //Forgot password - failed email send
// test('Given a user is on login page, when forgot password fails, then an error message should display',async ()=>{
//     mockSendPasswordResetEmail.mockRejectedValue(new Error('fail'));//simulate failure
//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i),{target:{value:'fail@email.com'}});
//     fireEvent.click(screen.getByText(/forgot your password/i));
//     expect(await screen.findByText(/failed to send reset email/i)).toBeInTheDocument();
// });
test.todo('should render correct component based on route');