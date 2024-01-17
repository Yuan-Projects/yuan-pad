import CommentForm from './CommentForm';
import CommentList from './CommentList';
import CommentStatistics from './CommentStatistics';
import { useAppConfig, useTranslation } from '../common/dataHooks';

function CommentBox(props: any) {
  const { currentPage, commentListType, comments, commentsTotalNumber } = props.commentsData;
  const { data: lang } = useTranslation();
  const { data: appConfig } = useAppConfig();
  return (
    <div className="commentBox">
      <h1>{lang.WELCOME_POST}</h1>
      {props.isSearch && (
        <p>
          Search {props.searchText} :<button onClick={props.onCloseSearch}>Close</button>
        </p>
      )}
      <CommentList commentListType={commentListType} data={comments} searchText={props.searchText} />
      <CommentStatistics
        commentListType={commentListType}
        onCloseSearch={props.onCloseSearch}
        onPageChanged={props.onPageChanged}
        total={commentsTotalNumber}
        currentPage={currentPage}
        pagenum={appConfig?.page_on ? Math.ceil(commentsTotalNumber / appConfig.num_perpage) : 1}
      />
      {commentListType !== 1 ? (
        ''
      ) : (
        <CommentForm commentListType={commentListType} user={props.user} onCommentCreated={props.onCommentCreated} />
      )}
    </div>
  );
}

export default CommentBox;
