<template>
        <div class="page-content">
        <div class="main-wrapper">
            <div class="profile-header">
                <div class="row">
                    <div class="col">
                        <div class="profile-img">
                            <img src="../../assets/img/avatar/profile-image-1.png" alt="profile picture">
                        </div>
                        <div class="profile-name">
                            <h3>{{ user.name }}</h3>
                        </div>
                        <div class="profile-menu">
                            <ul>
                                <li>
                                    <a href="#">Contact</a>
                                </li>
                                <li>
                                    <a href="#">About</a>
                                </li>
                            </ul>
                            <div class="profile-status">
                                <i class="active-now"></i> Active now
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="profile-content">
                <div class="row flex flex-col md:flex-row">
                    <div class="w-full md:w-2/3 p-4">
                        <div class="card">
                            <!-- <div class="card-body">
                                <div class="post">
                                    <div class="post-header">
                                        <img src="../../assets/img/avatar/profile-image-3.jpg" alt="profile3">
                                        <div class="post-info">
                                            <span class="post-author">Riley Beach</span><br>
                                            <span class="post-date">3hrs</span>
                                        </div>
                                        <div class="post-header-actions">
                                            <a href="#"><i class="fas fa-ellipsis-h"></i></a>
                                        </div>
                                    </div>
                                    <div class="post-body">
                                        <p>Proin eu fringilla dui. Pellentesque mattis lobortis mauris eu tincidunt. Maecenas hendrerit faucibus dolor, in commodo lectus mattis ac.</p>
                                         <img src="../../assets/img/post-1.jpg" class="post-image" alt=""> 
                                    </div>
                                    <div class="post-actions">
                                        <ul class="list-unstyled">
                                            <li>
                                                <a href="#" class="like-btn"><i class="far fa-heart"></i>Like</a>
                                            </li>
                                            <li>
                                                <a href="#"><i class="far fa-comment"></i>Comment</a>
                                            </li>
                                            <li>
                                                <a href="#"><i class="fas fa-share"></i>Share</a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="post-comments">
                                        <div class="post-comm">
                                            <img src="../../assets/img/avatar/profile-image-2.png" class="comment-img">
                                            <div class="comment-container">
                                                <span class="comment-author">
                                                    Sonny Rosas
                                                    <small class="comment-date">5min</small>
                                                </span>
                                            </div>
                                            <span class="comment-text">
                                                Mauris ultrices convallis massa, nec facilisis enim interdum ac.
                                            </span>
                                        </div>
                                        <div class="post-comm">
                                            <img src="../../assets/img/avatar/profile-image.png" class="comment-img">
                                            <div class="comment-container">
                                                <span class="comment-author">
                                                    Jacob Lee
                                                    <small class="comment-date">27min</small>
                                                </span>
                                            </div>
                                            <span class="comment-text">
                                                Cras tincidunt quam nisl, vitae aliquet enim pharetra at. Nunc varius bibendum turpis, vitae ultrices tortor facilisis ac.
                                            </span>
                                        </div>
                                        <div class="new-comment">
                                            <form action="javascript: void(0)">
                                                <div class="input-group">
                                                    <input type="text" name="comment" class="form-control search-input" placeholder="Type something...">
                                                    <div class="input-group-append">
                                                        <button class="btn btn-secondary" type="button" id="button-addon1">Comment</button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div> -->
                        </div>
                        <div class="card">
                            <!-- <div class="card-body">
                                <div class="post">
                                    <div class="post-header">
                                        <img src="../../assets/img/avatar/profile-image.png">
                                        <div class="post-info">
                                            <span class="post-author">Haydon Kenny</span><br>
                                            <span class="post-date">7hrs</span>
                                        </div>
                                        <div class="post-header-actions">
                                            <a href="#"><i class="fas fa-ellipsis-h"></i></a>
                                        </div>
                                    </div>
                                    <div class="post-body">
                                        <p>Praesent purus purus, varius ac mauris quis, scelerisque ornare massa. Nam volutpat lacinia lectus, vitae mattis nisl. Mauris ultrices convallis massa, nec facilisis enim interdum ac. Suspendisse hendrerit risus nec nisi dictum efficitur. Pellentesque aliquet in justo id lobortis.</p>
                                    </div>
                                    <div class="post-actions">
                                        <ul class="list-unstyled">
                                            <li>
                                                <a href="#" class="like-btn"><i class="far fa-heart"></i>Like</a>
                                            </li>
                                            <li>
                                                <a href="#"><i class="far fa-comment"></i>Comment</a>
                                            </li>
                                            <li>
                                                <a href="#"><i class="fas fa-share"></i>Share</a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="post-comments">
                                        <div class="post-comm">
                                            <img src="../../assets/img/avatar/profile-image-2.png" class="comment-img">
                                            <div class="comment-container">
                                                <span class="comment-author">
                                                    Riley Beach
                                                    <small class="comment-date">1hr</small>
                                                </span>
                                            </div>
                                            <span class="comment-text">
                                                Fusce mattis fermentum quam non porta...
                                            </span>
                                        </div>
                                        <div class="new-comment">
                                            <form action="javascript: void(0)">
                                                <div class="input-group">
                                                    <input type="text" name="comment" class="form-control search-input" placeholder="Type something...">
                                                    <div class="input-group-append">
                                                        <button class="btn btn-secondary" type="button" id="button-addon1">Comment</button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div> -->
                        </div>
                    </div>
                    <div class="w-full md:w-1/3 p-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Contact Info</h5>
                                <ul class="list-unstyled profile-about-list">
                                    <li><i class="material-icons">mail_outline</i><span>{{ user.email }}</span></li>
                                    <li><i class="material-icons">home</i><span>Lives in <a href="#">San Francisco, CA</a></span></li>
                                    <li><i class="material-icons">local_phone</i><span>{{ user.mobile_phone }}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { computed } from 'vue'

export default{
    setup() {
        const authStore = useAuthStore();
        const user = computed(() => authStore.user);
        
        return{
            user,
        };
    },    
}

</script>
<style lang="css">

.page-container:before{
    width:100%;
    height:350px;
    top:0;left:0;
    position:absolute;
    content:'';
    background:url(../../assets/img/profile-bg.jpg) no-repeat;
    background-size:cover;
    z-index:-3
}

.page-container:after{
    width:100%;
    height:350px;
    top:0;
    left:0;
    position:absolute;
    content:'';
    background:rgba(0,0,0,.8);
    z-index:-2;
}

.page-header .navbar ul.navbar-nav>li>a:hover
{
    color:#fff
}

.page-header #nav-search{
    background:rgba(255,255,255,.2);
    color:#eee;
}

.page-header #nav-search:focus
{
    background:rgba(255,255,255,.3)
}

.page-content{padding-top:70px}

.profile-header 
.profile-img{
    position:relative;
    float:left;
    margin-top:40px;
}

.profile-header .profile-img img{width:160px}

.profile-header .profile-img:before{
    width:170px;
    height:170px;
    left:-5px;
    top:-5px;content:'';
    background:#fff;
    border-radius:210px;
    position:absolute;
    z-index:-1;
    box-shadow:0 0 1.25rem rgba(31,45,61,.2)
}

.profile-header .profile-name{
    display:block;
    float:left;
    margin-top:82px;
    margin-left:30px;
    color:#fff;
}

.profile-header .profile-name span{
    margin-top:45px;
    display:block;
    color:#7d7d83;
    font-family:Montserrat,sans-serif;
    font-size:12px;
    text-transform:uppercase;
    font-weight:700
}

.profile-header .profile-menu{
    float:right;
    height:174px;
    display:flex;
    flex-direction:column;
    align-items:end
}

.profile-header .profile-menu ul{
    margin-top:auto;
    list-style:none;
    margin-bottom:0;
    overflow:hidden;
    padding-left:0
}

.profile-header .profile-menu ul li{float:left}

.profile-header .profile-menu ul li a{
    display:block;
    padding:15px;
    margin:12px 10px;
    font-size:13px;
    line-height:25px;
    font-weight:700;
    color:rgba(255,255,255,.6);
    -webkit-transition:all .2s ease-in-out;
    -moz-transition:all .2s ease-in-out;
    -o-transition:all .2s ease-in-out;
    transition:all .2s ease-in-out
}
.profile-header .profile-menu ul li a:hover{color:#fff}

.profile-header .profile-menu .profile-status{
    height:40px;
    align-self:flex-end;
    padding:20px 25px;
    font-weight:700;
    font-family:Montserrat,sans-serif;
    font-size:12px;
    text-transform:uppercase
}

.profile-header .profile-menu .profile-status i{
    width:6px;
    height:6px;
    content:'';
    position:relative;
    border-radius:6px;
    float:left;
    display:block;
    margin:7px 10px;
}
.profile-header .profile-menu .profile-status i.active-now{background:#5fd0a5}

.profile-content{margin-top:40px}

.profile-about-list{
    margin-bottom:0;
}

.profile-about-list li{
    display: flex;
    margin-bottom:8px;
    position:relative;
}

.profile-about-list li:last-child{margin-bottom:0}

.profile-about-list li i{
    font-size:17px;
    width:25px;
    position:relative;
    top:2px;
}

.profile-about-list li span{
    padding-left:25px;
    display:block;
}

.post-body .post-header{
    display:block;
    overflow:hidden;
    width:100%;
}

.post-header img{
    width:50px;
    height:50px;
    border-radius:50px;
    float:left;
}

.post-header .post-info{
    float:left;
    padding:5px 15px 0 15px;
}
.post-header .post-info span.post-author{
    font-size:13px;
    font-weight:700;
    color:#474747;
}
.post-header .post-info span.post-date{font-size:13px}

.post-header .post-header-actions{float:right;padding:15px 0}

.post-header .post-header-actions a{
    color:#7d7d83;
    line-height:20px;
    -webkit-transition:all .2s ease-in-out;
    -moz-transition:all .2s ease-in-out;
    -o-transition:all .2s ease-in-out;
    transition:all .2s ease-in-out;
}

.post-header .post-header-actions a:hover{color:#5fd0a5}

.post-body{
    padding:15px 0 0 0;
    position:relative
}

.post-body p{margin-bottom:0}

.post-body .post-image{
    display:block;
    width:100%;
    border-radius:6px;
    margin-top:15px
}

.post-actions,.post-actions ul{
    display:block;
    overflow:hidden;
    margin-bottom:0;
}

.post-actions{
    border-top:1px solid #e5e9ec;
    padding-top:5px;
    margin-top:15px;
}

.post-actions ul li a{
    float:left;
    padding:9px 16px;
    font-size:13px;
    margin-right:10px;
    font-weight:700;
    color:#474747;
    -webkit-transition:all .2s ease-in-out;
    -moz-transition:all .2s ease-in-out;
    -o-transition:all .2s ease-in-out;
    transition:all .2s ease-in-out;
}

.post-actions ul li a:hover{color:#5fd0a5}

.post-actions ul li a.liked{color:#844ff1}

.post-actions ul li a.liked i:before{content:'\f004'}

.post-actions ul li a i{margin-right:7px}
.post-comments{
    margin-top:5px;
    border-top:1px solid #e5e9ec;
    padding-top:15px;
}

.post-comments .post-comm{
    display:block;
    margin-bottom:10px;
    background:#fafafa;
    border:1px solid #e8e8e8;
    border-radius:10px;
    padding:20px;
    overflow:hidden
}
.post-comments .post-comm:last-child{margin-bottom:0}

.post-comments .post-comm img{
    width:30px;
    height:30px;
    border-radius:30px;
    float:left;
}
.post-comments .post-comm .comment-container{
    float:left;
    padding:0 10px;
    width:calc(100% - 30px);
    display:block;
}
.post-comments .post-comm .comment-container span.comment-author{
    color:#333;
    font-weight:700;
    display:block;
    line-height:30px
}
.post-comments .post-comm .comment-container span.comment-author small{float:right;font-size:12px;color:#646464}
.post-comments .post-comm .comment-text{padding:10px 0 0 0;display:inline-block}
.post-comments 
.input-group>.input-group-append>.btn{
    border-top-right-radius:20px;
    border-bottom-right-radius:20px;
    border-left:1px solid #e8e8e8;
}
.post-comments .new-comment{margin-top:20px}
.file-manager-menu{margin-top:20px}
</style>