// B1: Render playlist UI
// B2: scroll Top
// B3: Play / pause / seek
// B4: CD rotate
// B5: Next / prev
// B6: Ramndom
// B7: Next / Repeat when ended
// B8: Active song
// B9: Scroll active song into view
// 10: Play song when click

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'hlog'

const cd = $('.cd');

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio'); 
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $(".btn-random");
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    // Lay ra chi muc dau tien cua mang
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        { 
            name: 'Đông kiếm em',
            singer: 'Thái Vũ',
            path: './assests/music/song1.mp3',
            image: './assests/img/song1.jpg'
        },
        { 
            name: 'Đã từng là',
            singer: 'Thái Vũ',
            path: './assests/music/song2.mp3',
            image: './assests/img/song2.jpg'
        },
        { 
            name: 'Ngỡ như là',
            singer: 'Thái Vũ',
            path: './assests/music/song3.mp3',
            image: './assests/img/song3.jpg'
        },
        { 
            name: 'Lời yêu em',
            singer: 'Thái Vũ',
            path: './assests/music/song4.mp3',
            image: './assests/img/song4.jpg'
        },
        { 
            name: 'Đã từng là v2',
            singer: 'Thái Vũ',
            path: './assests/music/song5.mp3',
            image: './assests/img/song5.jpg'
        },
        { 
            name: 'Mùa hè của em',
            singer: 'Thái Vũ',
            path: './assests/music/song6.mp3',
            image: './assests/img/song6.jpg'
        },
        { 
            name: 'Phút ban đầu',
            singer: 'Thái Vũ',
            path: './assests/music/song7.mp3',
            image: './assests/img/song7.jpg'
        },
        { 
            name: 'Thằng nam khóc',
            singer: 'Thái Vũ',
            path: './assests/music/song8.mp3',
            image: './assests/img/song8.jpg'
        },
        { 
            name: 'Mùa mưa ngâu nằm cạnh',
            singer: 'Thái Vũ',
            path: './assests/music/song9.mp3',
            image: './assests/img/song9.jpg'
        },
        { 
            name: 'Còn anh',
            singer: 'Thái Vũ',
            path: './assests/music/song10.mp3',
            image: './assests/img/song10.jpg'
        },
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    // Tạo ra hàm render
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                    <div class="thumb"
                        style="background-image: url(${song.image})">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });

        playList.innerHTML = htmls.join('');
    },

    // Dinh nghia cho thuoc tinh
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    // Tạo ra hàm xử lý các sự kiện
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;

        // Xu ly CD quay / dung
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            // Chay bao lau 
            duration: 10000,
            // Giong loop kieu chay 
            interaction: Infinity, 
        });

        cdThumbAnimate.pause(); 

        // Xu ly phong to/ Thu nho CD
        document.onscroll = function() {
            // Gan gia tri khi thao tao voi scroll
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            // Tinh ra width new cd = width ban dau = scroll
            const newCdWidth = cdWidth - scrollTop;

            // Toan tu 3 ngoi
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            // Lay ty le moi chia ti le cu ra kich thuoc
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xu ly khi click play 
        playBtn.onclick = function() {
            // Kiem tra neu dang playing thi pause
            if(app.isPlaying) {
                audio.pause();
            } 
            // Nguoc lai thi play
            else {
                audio.play();
            }
        }

        // Bat su kien voi audio
        audio.onplay = function() {
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        audio.onpause = function() {
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // When progress change
        // Tra ve time thay doi
        audio.ontimeupdate = function() {
            // Tra ve thoi luong cua audio voi duration
            if (audio.duration) {
                // Tra ve vi tri hien tai trong audio voi currentTime
                const progressPrecent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPrecent;
            }
        }

        // Xu ly khi tua mp3
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime
        }

        // Xu ly khi next song
        nextBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.nextSong();
            }

            audio.play();

            // Khi next thi render lai
            app.render();

            // 
            app.scrollToActiveSong();
        }

        // Xu ly khi prev song
        prevBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.prevSong();
            }

            audio.play();
            app.scrollToActiveSong();
        }

        // Xu ly random bat / tat 
        randomBtn.onclick = function(e) {
            // ban dau random = false thi gan bang true
            app.isRandom = !app.isRandom;

            app.setConfig('isRandom', app.isRandom);

            // Su dung tham so thu 2 cua classlist truyen boolean vao 
            randomBtn.classList.toggle("active", app.isRandom);
        }

        // Xu ly event khi audio ended
        audio.onended = function() {
            if (app.isRepeat) {
                app.play();
            } else {
                nextBtn.click();
            }
        }

        // Xu ly phat lai 1 bai hat (loop Song)
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat;

            app.setConfig('isRepeat', app.isRepeat);

           randomBtn.classList.toggle("active", app.isRandom);
        }

        // Lang nghe hanh vi click vao playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            // e.target tra ve chinh cai ma cta bam vao 
            // Neu bam vao ko phai la class acitve or la class option thi tra ve e.target
            if (songNode || e.target.closest('.option')) {
                // Xu ly khi click vao song
                if (songNode) {
                    // Su dung dataset neu attr la data-index
                    // Vi currentIndex la so nen khi get songnode thanh chuoi nen phai convert
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    app.render();
                    audio.play();
                }

                //  Xu ly khi click vao song option
                if (e.target.closest('.option')) {

                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function() {
        this.currentIndex++;

        // Neu ma index hien tai >= do dai cua song
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;

        // Neu ma index hien tai >= do dai cua song
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },

    playRandomSong: function() {
        // Tao ra 1 index moi 
        let newIndex;
        do {
            // Gan gia tri ramdom moi vao bien newIndex
            newIndex = Math.floor(Math.random() * this.songs.length);
        } 
        // kiem tra xem bien moi trung thi lap lai 
        while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    
    // Tạo ra hàm start trong app
    start: function() {
        // Gan config vao khi duoc chay
        this.loadConfig();

        // Dinh nghia cac thuoc tinh cho obj
        this.defineProperties();

        // Call handleEvents
        this.handleEvents();

        // Load thong tin bai hat dau tien vao UI khi chay
        this.loadCurrentSong();

        // Call render
        this.render();

        randomBtn.classList.toggle("active", app.isRandom);
        repeatBtn.classList.toggle("active", app.isRepeat);
    }
}

// Call hàm start qua Array app 
app.start();