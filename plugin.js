$( document ).ready(function() {
    (function($) {
        $.fn.cardMover = function( config ) {
            let cardBeginState = $('li');
            let cardContainer = $(this);
            cardContainer.sortable();

            $('#btn').click(function(event) {
                cardContainer.empty().append(cardBeginState);
            });

            this.click(function(event) {
                let card = $(event.target);
                let cardMargin = parseInt(card.css('marginTop'));
                let cardHeight = card.outerHeight();
                let cardPosition = card.position();
                let cardsCount = cardContainer[0].children.length;
                let settings = $.extend({
                    direction: 'up',
                    index: 0,
                    debug: true
                }, config);
                settings.index = getValidIndex(settings.index);

                let {cardOffset, indexOffset, affectedSiblings, affectedSiblingsOffset} = mapSettingsToOffset(settings);

                function getValidIndex(index) {
                    return (settings.index > cardsCount || settings.index < 0 ) ?
                    0 :
                    index;
                }

                function mapSettingsToOffset({direction, index, debug}) {

                    function getCardOffset(affectedSiblings) {
                        let cardOffset = 0;

                        affectedSiblings.each(function() {
                            cardOffset += $(this).outerHeight() + cardMargin;
                        });
                        return direction === 'up' ? -cardOffset : cardOffset;
                    }

                    if (direction === 'up') {
                        let previousCards = card.prevAll();
                        let affectedSiblings = previousCards.slice(0, previousCards.length - index);

                        return {
                            cardOffset: getCardOffset(affectedSiblings),
                            indexOffset: index,
                            affectedSiblings: affectedSiblings,
                            affectedSiblingsOffset: cardHeight + cardMargin
                        };
                    } else {
                        let nextCards = card.nextAll();
                        let affectedSiblings = nextCards.slice(0, nextCards.length - index);

                        return {
                            cardOffset: getCardOffset(affectedSiblings),
                            indexOffset: cardsCount - 1 - index,
                            affectedSiblings: affectedSiblings,
                            affectedSiblingsOffset: -cardHeight - cardMargin
                        };
                    }
                };

                function updateCardPosition(anchorElement) {
                    return settings.direction === 'up' ?
                        this.insertBefore(anchorElement) :
                        this.insertAfter(anchorElement);
                }

                function isCardValid(card) {

                    function isCardIndexValid() {
                        if (settings.index === 0 ) {
                            return true;
                        } else {
                            return settings.direction === 'up' ?
                                card.index() > settings.index - 1 :
                                card.index() < cardsCount - settings.index;
                        }
                    }

                    let isCardValid = ( card.prop('tagName') === 'LI' && isCardIndexValid() );
                    if (!isCardValid) {
                        let errorMessage = settings.direction === 'up' ?
                            `Please pick a card positioned from #${settings.index + 1} to #${cardsCount}` :
                            `Please pick a card positioned from #1 to #${cardsCount - settings.index}`;

                        $('#warning').empty();
                        $('#warning').append(errorMessage);
                    }
                    return isCardValid;
                }


                if ($(':animated').length || !isCardValid(card)) return;

                $('#warning').empty();
                card.animate({left: cardPosition.left + 300}, 300)
                    .animate({top: cardOffset}, 300)
                    .animate({left: 0}, 300);
                affectedSiblings.animate({top: affectedSiblingsOffset});

                $(':animated').promise().done(function() {
                    updateCardPosition.call(card, cardContainer[0].children[indexOffset]);
                    $('li').css({top: 0, left: 0});
                    if (settings.debug) console.log($('li'));
                });
            });
        }
    })( jQuery );
    $('.card-container').cardMover({direction: 'up', index: 1, debug: false});
});
