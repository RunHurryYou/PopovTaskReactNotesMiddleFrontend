import { Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthProvider/AuthProvider'
import { EditModeProvider } from './contexts/EditMode/EditModeProvider'
import { SelectedNoteProvider } from './contexts/SelectedNote/SelectedNoteProvider'
import { HeaderLayout } from './layouts/HeaderLayout'
import { publickRoutes } from './config/routes.config'
import { NotFound } from './pages/NotFound/NotFound'
import { AuthPage } from './pages/AuthPage/AuthPage'
import { NotePage } from './pages/NotesPage/NotePage'
import { PrivateRoute } from './shared/components/PrivateRoute/PrivateRoute'

function App() {
	return (
		<>
			<AuthProvider>
				<EditModeProvider>
					<SelectedNoteProvider>
						<Routes>
							<Route element={<HeaderLayout />}>
								<Route path={publickRoutes.home} element={<PrivateRoute><NotePage/></PrivateRoute>} />
								<Route path={publickRoutes.notFound} element={<NotFound />} />
								<Route path={publickRoutes.login} element={<AuthPage/>} />
							</Route>
						</Routes>
					</SelectedNoteProvider>
				</EditModeProvider>
			</AuthProvider>
		</>
	)
}

export default App
