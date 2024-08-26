import type { RouterOutputs } from "@/utils/api";

export type ArticleProps = RouterOutputs["articleRouter"]["getArticles"][number];

export type GlobalContextType = {
  isWriteModalOpen: boolean;
  setWriteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type WriteFormType = {
  title: string;
  description: string;
  html: string;
  markdown: string;
};

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

export type CommentSidebarProps = {
  showCommentSidebar: boolean;
  setShowCommentSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  articleId: string,
};

export type CommentFormType = {
  comment: string
}

export type TagFormType = {
  name: string;
  description: string;
};

export type TagFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type TAG = { id: string, name: string }

export type TagsAutocompletionProps = {
  tags: TAG[];
  selectedTags: TAG[];
  setSelectedTags: React.Dispatch<React.SetStateAction<TAG[]>>; // I added this undefined
}

export type UnsplashGalleryProps = {
  isUnsplashModalOpen: boolean,
  setUnsplashModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  articleId: string,
  slug: string
}

export type pushTagsType = {
  article: {
    tags: {
      name: string;
    }[];
  };
}[];

export type tagObjectType = {
  article: {
    tags: {
      name: string;
    }[];
  };
};

export type GoogleUserProfileType = {
  id: string,
  name: string,
  email: string,
  username?: string,
  image?: string
}

export type EditArticleProps = {
  articleId: string, slug: string,
  isEditModalOpen: boolean,
  setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}