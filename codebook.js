window.codebook = (function(){
	var BLOCK_SIZE = 512;
	var STRING_BLOCK_SIZE = BLOCK_SIZE / 8;

	return {
		encrypt: encrypt,
		decrypt: decrypt
	};
	
	function sha3(str)
	{
		var shaObj = new jsSHA("SHA3-" + BLOCK_SIZE, "TEXT");
		shaObj.update(str);
		return shaObj.getHash("BYTES");
	}

	function encrypt(message, password)
	{
		var textBlocks = [];
		while(message.length > STRING_BLOCK_SIZE)
		{
			var newTextBlock = message.substring(0, STRING_BLOCK_SIZE);
			textBlocks.push(newTextBlock);
			
			message = message.substring(STRING_BLOCK_SIZE);
		}
		if(message.length > 0)
		{
			/*
			// adding random bytes to fit in block size
			var bytesToFill = STRING_BLOCK_SIZE - message.length;
			for(var i = 0; i < bytesToFill; i++)
			{
				message += String.fromCharCode(Math.floor(Math.random() * 256));
			}
			*/
			textBlocks.push(message);
		}
		
		
		var cryptBlock = sha3(password);
		
		var encryptedMessage = "";
		for(var i = 0; i < textBlocks.length; i++)
		{
			var encryptedBlock = encryptBlock(textBlocks[i], cryptBlock);
			encryptedMessage += encryptedBlock;
			cryptBlock = sha3(encryptedBlock + textBlocks[i]);
		}
		
		return encryptedMessage;
	}

	function encryptBlock(textBlock, cryptBlock)
	{
		var encryptedBlock = "";
		
		for(var i = 0; i < textBlock.length; i++)
		{
			var tbByte = textBlock.charCodeAt(i);
			var cbByte = cryptBlock.charCodeAt(i);
			var encryptedByte = tbByte - cbByte;
			if(encryptedByte < 0) encryptedByte += 256;
			encryptedBlock += String.fromCharCode(encryptedByte);
		}
		
		return encryptedBlock;
	}

	function decrypt(encryptedMessage, password)
	{
		var encryptedTextBlocks = [];
		while(encryptedMessage.length > 0)
		{
			var newEncryptedTextBlock = encryptedMessage.substring(0, STRING_BLOCK_SIZE);
			encryptedTextBlocks.push(newEncryptedTextBlock);
			
			encryptedMessage = encryptedMessage.substring(STRING_BLOCK_SIZE);
		}		
		
		var cryptBlock = sha3(password);
		
		var decryptedMessage = "";
		for(var i = 0; i < encryptedTextBlocks.length; i++)
		{
			var decryptedTextBlock = decryptBlock(encryptedTextBlocks[i], cryptBlock);
			decryptedMessage += decryptedTextBlock;
			cryptBlock = sha3(encryptedTextBlocks[i] + decryptedTextBlock);
		}
		
		return decryptedMessage;
	}

	function decryptBlock(encryptedTextBlock, cryptBlock)
	{
		var decryptedBlock = "";
		
		for(var i = 0; i < encryptedTextBlock.length; i++)
		{
			var ebByte = encryptedTextBlock.charCodeAt(i);
			var cbByte = cryptBlock.charCodeAt(i);
			var decryptedByte = ebByte + cbByte;
			if(decryptedByte > 255) decryptedByte -= 256;
			decryptedBlock += String.fromCharCode(decryptedByte);
		}
		
		return decryptedBlock;
	}
})();

