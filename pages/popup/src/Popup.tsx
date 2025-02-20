import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';

const Popup = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen code text-white">
      <h1 className="logo">SteamBuddy</h1>

      <div className="flex flex-col items-center mt-10">
        {/*<p className="text-sm text-gray-400 mb-2">source code</p>*/}
        <div className="flex space-x-6">
          <a href="https://github.com/vitaxa/steambuddy-extension" target="_blank" rel="noopener noreferrer">
            <img src={chrome.runtime.getURL('popup/github_logo.svg')} alt="GitHub" className="w-10 h-10" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading ...</div>), <div>Error Occurred</div>);
