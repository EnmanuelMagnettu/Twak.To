import { useQuery } from '@apollo/client';
import AddIcon from '@mui/icons-material/Add';
import { Masonry as MuiMasonry } from '@mui/lab';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Post, PostType, } from '../../__generated__/graphql';
import Header from '../../components/Layout/Header';
import Masonry from '../../components/Masonry/Masonry';
import PostSkeleton from '../../components/PostComponents/PostSkeleton';
import Tabs from '../../components/Tabs/Tabs';
import { DeviceContext } from '../../context/DeviceContext';
import { GET_CURRENT_USER_POSTS } from '../../graphql/queries';
import { ContentBoardTabs } from '../../types';
import HOCEditorModal from '../../components/PostComponents/HOC/EditorModal';
import { ChatWidget } from '../../tawk/Chat';
import { AuthContext } from '../../context/AuthContext';

enum PostFilterOptions {
  MyPost = 'My Post',
  ForYou = 'For You',
  Advocacy = 'Advocacy',
  Blog = 'Blog',
  Corporate = 'Corporate',
}

const ContentBoard = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [showChat, setShowChat] = useState<boolean>(true);
  const [openedPostId, setOpenedPost] = useState<string | null>(null);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<PostFilterOptions[]>([]);
  const [currentTab, setCurrentTab] = useState<ContentBoardTabs>(
    ContentBoardTabs.content,
  );

  const handelOpenNewPost = () => {
    setOpenNewPost(true);
    setShowChat(false);
  };

  const { isMobile } = useContext(DeviceContext);

  const { loading, error } = useQuery(GET_CURRENT_USER_POSTS, {
    variables: {
      filter: {
        ...(currentTab !== ContentBoardTabs.posted && {
          isPublished: true,
          isScheduled: true,
        }),
        ...(currentTab === ContentBoardTabs.posted && {
          isPosted: true,
        }),
        ...(currentTab === ContentBoardTabs.favorites && {
          isFavorite: true,
          isPosted: true,
        }),
      },
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (currentTab === ContentBoardTabs.posted) {
        data.currentUserPosts.sort((a, b) => {
          const aPostedAt = a.postedAt ? new Date(a.postedAt).getTime() : 0;
          const bPostedAt = b.postedAt ? new Date(b.postedAt).getTime() : 0;
          return bPostedAt - aPostedAt;
        });
      }
      setPosts(data.currentUserPosts);
      setFilteredPosts(data.currentUserPosts);
    },
  });

  const handlePostEditorClose = () => {
    setOpenNewPost(false);
    setOpenedPost(null);
    setShowChat(true);
  };

  const formatPostType = (postType: PostFilterOptions): string => {
    switch (postType) {
      case PostFilterOptions.Advocacy:
        return 'ADVOCACY';
      case PostFilterOptions.Corporate:
        return 'CORPORATE';
      case PostFilterOptions.ForYou:
        return 'READY_TO_SHARE';
      case PostFilterOptions.Blog:
        return 'BLOG';
      default:
        return postType;
    }
  };

  const applyFilterOnPosts = useCallback(() => {
    const isMyPost = (post: Post) =>
      post.createdById === post.userId && post.type === PostType.ReadyToShare;
    const isPostTypeSelected = (post: Post) =>
      selectedOptions.map(formatPostType).includes(post.type);
    const isMyPostOptionSelected = selectedOptions.includes(PostFilterOptions.MyPost);

    return posts.filter((post) => {
      if (isMyPostOptionSelected && isMyPost(post)) {
        return true;
      }
      return isPostTypeSelected(post);
    });
  }, [selectedOptions, posts]);

  const toggleFilterOption = (option: PostFilterOptions) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  useEffect(() => {
    if (selectedOptions.length === 0) {
      setFilteredPosts(posts);
      return;
    }
    setFilteredPosts(applyFilterOnPosts());
  }, [selectedOptions, posts, applyFilterOnPosts]);

  return (
    <Box width={'100%'}>
      {user !== null && <ChatWidget showChat={showChat} user={user} />}
      <Stack
        data-testid="content-board"
        direction="column"
        alignItems="center"
        p={isMobile ? '15px 15px' : '40px 15px'}
        rowGap={2}
        maxWidth={'1800px'}
        alignSelf={'center'}
        marginX={'auto'}
      >
        <Header />
        <Stack
          direction={{ sm: 'column', md: 'row' }}
          spacing={1}
          justifyContent={'space-between'}
          width={'100%'}
          paddingX={1}
        >
          <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} />

          {!isMobile && (
            <Stack flexDirection={'row'} gap={0.5}>
              {Object.values(PostFilterOptions).map((filter, i) => (
                <Button
                  key={i}
                  sx={{
                    border: selectedOptions.includes(filter)
                      ? '0.5px solid #FF007A'
                      : '1px solid #949494',
                    color: selectedOptions.includes(filter)
                      ? 'primary.main'
                      : 'text.secondary',
                    borderRadius: '3px',
                  }}
                  onClick={() => toggleFilterOption(filter)}
                  data-testid={`filter-button-${i}`}
                >
                  <Typography fontWeight="bold">{filter}</Typography>
                </Button>
              ))}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handelOpenNewPost}
                data-testid="new-advocacy-post-button"
                sx={{ marginLeft: '5px' }}
              >
                <Typography fontWeight="bold">New Post</Typography>
              </Button>
            </Stack>
          )}
        </Stack>

        {loading ? (
          posts.length ? (
            <Masonry posts={filteredPosts} />
          ) : (
            <MuiMasonry
              columns={{
                xs: 1,
                sm: 2,
                md: 3,
                lg: 4,
                xl: 5,
              }}
              spacing={2}
            >
              {[...Array(10)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </MuiMasonry>
          )
        ) : error ? (
          <Typography>There was an unexpected error. Please try again.</Typography>
        ) : posts.length ? (
          <Masonry posts={filteredPosts} onPostOpen={(postId) => setOpenedPost(postId)} />
        ) : (
          <Typography>There are no posts available.</Typography>
        )}
      </Stack>
      {(!!openedPostId || openNewPost) && (
        <HOCEditorModal postId={openedPostId} onClose={handlePostEditorClose} />
      )}
    </Box>
  );
};

export default ContentBoard;
