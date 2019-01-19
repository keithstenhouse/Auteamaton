$(document).ready(() => {
    $('.delete-captain').on('click', (event) => {
        const id = $(event.target).attr('data-id');
 
        if (confirm('Are you sure you want to delete the captain?')) {
            $.ajax({
                type: 'DELETE',
                url: '/captains/'+id,
                success: response => {
                    window.location.href='/captains';
                },
                error: err => {
                    console.log(err);
                    window.location.href='/captains';
                }
            });
        }
    });

    $('.delete-team').on('click', (event) => {
        const id = $(event.target).attr('data-id');
 
        if (confirm('Are you sure you want to delete the team?')) {
            $.ajax({
                type: 'DELETE',
                url: '/teams/'+id,
                success: response => {
                    window.location.href='/teams';
                },
                error: err => {
                    console.log(err);
                    window.location.href='/teams';
                }
            });
        }
    });

    $('.delete-match').on('click', (event) => {
        const id = $(event.target).attr('data-id');
 
        if (confirm('Are you sure you want to delete the match?')) {
            $.ajax({
                type: 'DELETE',
                url: '/matches/'+id,
                success: response => {
                    window.location.href='/matches';
                },
                error: err => {
                    console.log(err);
                    window.location.href='/matches';
                }
            });
        }
    });

    $('.delete-squadplayer').on('click', (event) => {
        const id = $(event.target).attr('data-id');
 
        if (confirm('Are you sure you want to delete the squad player?')) {
            $.ajax({
                type: 'DELETE',
                url: '/squadplayers/'+id,
                success: response => {
                    window.location.href='/squadplayers';
                },
                error: err => {
                    console.log(err);
                    window.location.href='/squadplayers';
                }
            });
        }
    });

    $('.delete-player').on('click', (event) => {
        const id = $(event.target).attr('data-id');
 
        if (confirm('Are you sure you want to delete the club player (N.B. The player will be removed from all squads?')) {
            $.ajax({
                type: 'DELETE',
                url: '/players/'+id,
                success: response => {
                    window.location.href='/players';
                },
                error: err => {
                    console.log(err);
                    window.location.href='/players';
                }
            });
        }
    });

    // SMS STUFF COMMENTED OUT FOR NOW AS IT WAS A RESPONSE TO A BUTTON THAT NO LONGER EXISTS ON THE INDEX PAGE (MOVED TO SMS.pug)
    // const numberInput = document.getElementById('number');
    // const textInput = document.getElementById('msg');
    // const button = document.getElementById('request-squad-availability');
    
    // button.addEventListener('click', request_squad_availability, false);

    // function request_squad_availability() {
    //     // const number = numberInput.value.replace(/\D/g, '');
    //     // const text = textInput.value;

    //     fetch('/messaging/request_squad_availability', {
    //         method: 'post',
    //         headers: { 'Content-type': 'application/json' },
    //         body: JSON.stringify({ myname: "Keith" })
    //     })
    //     .then(res => {
    //         if (res.status >= 200 && res.status <= 400) {
    //             console.log(res.status);
    //         }
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });
    // }
});