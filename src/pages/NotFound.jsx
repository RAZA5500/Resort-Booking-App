import { Link } from '../lib/router';

const NotFound = ({
  title = 'Page not found',
  message = 'The page you were looking for does not exist.',
  action = { to: '/', label: 'Back to all stays' },
}) => (
  <div className="relative z-10 container mx-auto px-6 py-32 flex flex-col items-center text-center">
    <div className="text-6xl mb-6">🧳</div>
    <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
    <p className="text-slate-400 max-w-md mb-8 leading-relaxed">{message}</p>
    <Link
      to={action.to}
      className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-200 transition-colors"
    >
      {action.label}
    </Link>
  </div>
);

export default NotFound;
