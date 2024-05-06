import React from 'react';
import ReactDOM from 'react-dom';
import SearchForm from './SearchForm';
import ResultsRender from './ResultsRender';
import SentResultsRender from './SentResultsRender';
import ModeSelector from './ModeSelector';
import PostSummary from './PostSummary';

ReactDOM.render(
    <div>
        <SearchForm />
        <div className="row">
            <div className="col-md-4">
                <ModeSelector />
            </div>
            <div className="col-md-8">
                <PostSummary />
            </div>
        </div>
        <SentResultsRender />
        <ResultsRender />
    </div>,
    document.getElementById('app_root')
)
