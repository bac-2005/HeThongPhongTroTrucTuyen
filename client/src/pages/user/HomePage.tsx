import SidebarLeft from '../../components/user/SidebarLeft';
import PostList from '../../components/user/PostList';
import SidebarRight from '../../components/user/SidebarRight';
import '../../css/HomePage.css'

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="main-content">
        <SidebarLeft />
        <PostList />
      </div>

      <div className="side-content">
        <SidebarRight />
      </div>
    </div>
  );
};

export default HomePage;
