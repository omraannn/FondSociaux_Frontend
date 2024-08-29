import './App.scss'
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import {GuestLayout, AuthLayout} from './layouts'
import {Home, Login, Profile, Register, NotFound, WaitingConfirmation, AccessDenied} from './pages';
import {
    Categories,
    DashboardAdmin,
    Employees,
    Policies,
    TypeFees,
    EmployeesPending,
    Refunds, Roles
} from './pages/admin/index'
import useTokenRefresh from "./hooks/useTokenRefresh";
import userService from "./services/userService";
import {DashboardEmployee, RefundDemand, RefundsHistory} from "./pages/employee";



const isAuthenticated = await  userService.isAuthenticated();
const userRole = await  userService.getUserRole();




/*|--------------------------------------------------------------------------
| Routes accessible for all users
|-------------------------------------------------------------------------- */
const GuestRoutes = (
    <Route path="/" element={<GuestLayout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
    </Route>
);


/*|--------------------------------------------------------------------------
| Routes accessible for authenticated users
|-------------------------------------------------------------------------- */
const AuthRoutes = (
    <Route
        path="/auth/*"
        element={
            isAuthenticated ? (
                <AuthLayout />
            ) : (
                <Navigate to="/access-denied" />
            )
        }
    >
        <Route path="admin" element={<DashboardAdmin />} />
        <Route path="admin/roles" element={<Roles />} />
        <Route path="admin/categories" element={<Categories />} />
        <Route path="admin/frais" element={<TypeFees />} />
        <Route path="admin/policies" element={<Policies />} />
        <Route path="admin/employees/pending" element={<EmployeesPending />} />
        <Route path="admin/employees/confirmed" element={<Employees />} />
        <Route path="admin/Refunds" element={<Refunds />} />
        <Route path="profile" element={ <Profile />} />
        <Route path='employee' element={<DashboardEmployee />} />
        <Route path='employee/refunds/demand' element={<RefundDemand />} />
        <Route path="employee/refunds/history" element={<RefundsHistory />} />
        <Route path="access-denied" element={<AccessDenied />} />
        <Route  path="guest" element={userRole && userRole.length === 1 && userRole.includes("GUEST") ? (
                <WaitingConfirmation/>
            ):
                <Navigate to="/login"></Navigate>
        }/>
        <Route path="*" element={<NotFound />} />
    </Route>
);

function App() {
    const { contextHolder } = useTokenRefresh();
    return (
        <div className="App">
            { contextHolder }
            <Router>
                <Routes>
                    {GuestRoutes}
                    {AuthRoutes}
                </Routes>
            </Router>
        </div>
  )
}
export default App